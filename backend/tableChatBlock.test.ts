// websocket.test.ts
import { describe, it, expect} from 'vitest'
import { fastify } from '../src/server.js';
import { userMock } from './Mock.js';

describe('TABLE CHATBLOCK TEST', () => {
	it('01 - ADD A USER TO THE BLOCK LIST', async () => {
        await fastify.inject({
            method: 'POST',
            url: '/block-user',
            body: {
                userId: userMock['alice'].id,
                blockedUserId: userMock['bob'].id
            }
        });
	});

    it('02 - GET BLOCKED USERS', async () => {
        const getBlockedUsers = await fastify.inject({
            method: 'GET',
            url: '/blocked-users',
            query: {
                userId: userMock['alice'].id.toString()
            }
        });

        const response = getBlockedUsers.json();
        expect(response.blockedUsers).toBeDefined();
        expect(response.blockedUsers).toContain(userMock['bob'].id);
    });

    it('03 - REMOVE A USER FROM THE BLOCK LIST', async () => {
        await fastify.inject({
            method: 'DELETE',
            url: '/unblock-user',
            body: {
                userId: userMock['alice'].id,
                blockedUserId: userMock['bob'].id
            }
        });

        const getBlockedUsersAfterUnblock = await fastify.inject({
            method: 'GET',
            url: '/blocked-users',
            query: {
                userId: userMock['alice'].id.toString()
            }
        });

        const responseAfterUnblock = getBlockedUsersAfterUnblock.json();
        expect(responseAfterUnblock.blockedUsers).toBeDefined();
        expect(responseAfterUnblock.blockedUsers).not.toContain(userMock['bob'].id);
    });

});

