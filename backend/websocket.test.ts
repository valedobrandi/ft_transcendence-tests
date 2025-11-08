// websocket.test.ts
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import WebSocket from 'ws'
import { fastify } from '../server.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { waitForMessage } from './utils.js';


let port: number | null = null;

beforeAll(async () => {
	vi.spyOn(authenticationRoomInstance, 'verify').mockReturnValue(true);

	connectedRoomInstance.clear();
	await fastify.listen({ port: 0 });
	const adress = fastify.server.address();

	if (adress) port = typeof adress === 'string' ? null : adress.port;
});

afterAll(async () => {
	await fastify.close();
});

describe('WebSocket connect/disconnect logic', () => {

	it('adds client on connection and removes on close', async () => {
		const ws = new WebSocket(`ws://localhost:${port}/ws`);
		await new Promise(resolve => ws.once('open', resolve));
		connectedRoomInstance.addUser('test_client_1');
		const user = connectedRoomInstance.getById("test_client_1");
		expect(user).toBeDefined();

		// CONNECT_ROOM should add the client to connectedRoom
		const action = JSON.stringify({ type: 'CONNECT', username: 'test_client_1'});

		ws.send(action);

		await waitForMessage(ws, "message", "CONNECT_ROOM");

		expect(user?.socket).toBeDefined();

		ws.close();

		await new Promise<void>((resolve) => ws.once('close', resolve));

		expect(connectedRoomInstance.size()).toBe(0);

	});

});

