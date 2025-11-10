// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcrypt';
import { fastify } from "../src/server.js";
import { reset_database } from './utils.js';


beforeAll(async () => {
vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as any)
await reset_database();
});

afterAll(async () => {
    await fastify.close();
});

describe('JWT', async () => {
    it('1 - GET JWT', async () => {
        var response;
        // First, create a user to login
        response = await fastify.inject({
            method: 'POST',
            url: '/register',
            payload: {
                username: 'lola',
                password: 'pass',
                email: 'lola@example.com'
            },
        });

        expect(response.statusCode).toBe(201);

        // Then, login to get the JWT
        response = await fastify.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'lola',
                password: 'pass',
            },
        });

        expect(response.statusCode).toBe(201);

        var { payload } = response.json();
        //expect(payload).toBe({});
        expect(payload.accessToken).toBeDefined();
        expect(payload.username).toBe('lola');
        
        const profileRoute = await fastify.inject({
            method: 'GET',
            url: '/profile',
            headers: {
                Authorization: `Bearer ${payload.accessToken}`,
            },
        });
        
        const profilData = profileRoute.json();
        expect(profileRoute.statusCode).toBe(200)

    });

});
