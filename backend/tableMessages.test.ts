// websocket.test.ts
import WebSocket from 'ws'
import { describe, it, expect, beforeAll, afterAll} from 'vitest'
import { fastify, print } from '../server.js';
import { chatMessagersMock, userMock } from './Mock.js';
import db from '../../database/db.js';
import { MessagesModel } from '../models/messagesModel.js';

var port: number | null = null;
beforeAll(async () => {
	await fastify.listen({ port: 0 });
	const adress = fastify.server.address();
	if (adress) port = typeof adress === 'string' ? null : adress.port;
});

afterAll(async () => {
	await fastify.close();
});

describe('TABLE MESSAGES TEST', () => {
	const messagerModel = new MessagesModel(db)
	it('01 - SEND A MESSAGE FROM ALICE TO BOB', async () => {

		const ws = new WebSocket(`ws://localhost:${port}/ws`);
		await new Promise(resolve => ws.once('open', resolve));

		const action = JSON.stringify(chatMessagersMock[0]);
		ws.send(action);

		// Expect message to be saved in the database
		messagerModel.getMessages(userMock['alice'].id, userMock['bob'].id).forEach((msg: any) => {

			if (msg.content === "Hello") {
				expect(msg.sender_id).toBe(userMock['alice'].id);
				expect(msg.receiver_id).toBe(userMock['bob'].id);
				expect(msg.sender).toBe(userMock['alice'].id);
			}
		});
		ws.close();
		await new Promise<void>((resolve) => ws.once('close', resolve));
    });

});

