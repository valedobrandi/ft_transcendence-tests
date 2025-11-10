// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi, beforeEach } from 'vitest'
import WebSocket from 'ws'
import { fastify } from '../src/server.js';
import { waitForMessage } from './utils.js';
import bcrypt from 'bcrypt';
import { UsersModel } from '../src/models/usersModel.js';
import { AuthService } from '../src/services/authService.js';
import { authenticationRoomInstance } from '../src/state/authenticationRoom.js';
import { connectedRoomInstance } from '../src/state/ConnectedRoom.js';


let port: number | null = null;
beforeAll(async () => {
    // Mock usersModel findUserByEmailOrUsername
    vi.spyOn(UsersModel.prototype, 'findUserByEmailOrUsername')
        .mockImplementation((username: string) => {
            return {
                email: "alice@example.com",
                username: "alice",
                twoFA_enabled: true,
                password: "hashed_password_1"
            };
        });
    // Mock bycrypt
    vi.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);

    vi.spyOn(AuthService.prototype, 'sendEmail').mockResolvedValue({
        data: 'mocked-email-id',
        error: null,
    });

    connectedRoomInstance.clear();
    await fastify.listen({ port: 0 });
    const adress = fastify.server.address();
    if (adress) port = typeof adress === 'string' ? null : adress.port;
});

afterAll(async () => {
    await fastify.close();
});


describe('2FA', () => {
    it('1 - AUTHENTICATION WITH SUCESS', async () => {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);
        await new Promise(resolve => ws.once('open', resolve));

        const loginRoute = await fastify.inject({
            method: 'POST',
            url: '/login',
            body: {
                username: 'alice',
                email: 'alice@example.com',
                password: 'hashed_password_1',
                id: 4
            }
        });

        console.log('Login Route Response:', loginRoute.json());
        expect(loginRoute.statusCode).toBe(200);
        // AuthenticationRoom should have the code for user 'alice'
        const code = authenticationRoomInstance.getCode('alice');
        expect(code).toBeDefined();

        const verify2fRoute = await fastify.inject({
            method: 'POST',
            url: '/verify-2fa',
            body: {
                username: 'alice',
                code,
                id: 4
            }
        });

        expect(verify2fRoute.statusCode).toBe(200);
        expect(verify2fRoute.json().message).toBe('connected');

        const action = JSON.stringify({ type: 'CONNECT', username: 'alice', code });
        ws.send(action);
        const message = await waitForMessage(ws, "message", "CONNECT_ROOM");

        expect(authenticationRoomInstance.getCode('alice')).toBeUndefined();
        expect(connectedRoomInstance.getByName('alice')).toBeDefined();

    });

});

