// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import WebSocket from 'ws'
import { fastify } from '../server.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';
import { waitForMessage } from './utils.js';
import { gameRoom } from '../state/gameRoom.js';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { AuthService } from '../services/authService.js';
import { UsersModel } from '../models/usersModel.js';

let port: number | null = null;

beforeAll(async () => {
    vi.spyOn(authenticationRoomInstance, 'verify').mockReturnValue(true);

	vi.spyOn(UsersModel.prototype, 'saveGuestUsername').mockImplementation((username: string) => {
		return { message: 'User saved', username, id: 4 };
	});

    await fastify.listen({ port: 0 });
    const adress = fastify.server.address();
    if (adress) port = typeof adress === 'string' ? null : adress.port;
});

afterAll(async () => {
    await fastify.close();
});

describe('MATCH', () => {

	const authService = new AuthService();
    it('Start a Match With Sucess', async () => {
        if (!port) throw new Error('Server port not initialized');
        const ws = new WebSocket(`ws://localhost:${port}/ws`);
        let response: any;

        await new Promise<void>(resolve => ws.once('open', resolve));

		authService.guestLoginValidation('test-client-1');
		authService.guestLoginValidation('test-client-2');

        expect(connectedRoomInstance.size()).toBe(2);

        const test_client_1 = JSON.stringify({ type: 'CONNECT', username: 'test-client-1', code: '123456' });
        const test_client_2 = JSON.stringify({ type: 'CONNECT', username: 'test-client-2', code: '123456' });

        ws.send(test_client_1);
        response = await waitForMessage(ws, "message", "CONNECT_ROOM");
        expect(response.message).toContain("CONNECT_ROOM");

        ws.send(test_client_2);
        response = await waitForMessage(ws, "message", "CONNECT_ROOM");
        expect(response.message).toContain("CONNECT_ROOM");


        const match_request_1 = JSON.stringify({ type: 'MATCH', username: 'test-client-1' });
        const match_request_2 = JSON.stringify({ type: 'MATCH', username: 'test-client-2' });

        ws.send(match_request_1);
        response = await waitForMessage(ws, "message", "MATCH_ROOM");

        expect((connectedRoomInstance.getById('test-client-1'))?.status).toBe('MATCH_QUEUE');
        expect(response.message).toContain("MATCH_ROOM");

        ws.send(match_request_2);
        response = await waitForMessage(ws, "message", "GAME_ROOM");

        expect((connectedRoomInstance.getById('test-client-2'))?.status).toBe('GAME_ROOM');
        expect((connectedRoomInstance.getById('test-client-1'))?.status).toBe('GAME_ROOM');
        expect(response.message).toContain("GAME_ROOM");

        expect(gameRoom.size).toBe(1);

    });

});

