
import WS from "jest-websocket-mock";
import * as utils from '../src/utils.ts';
import * as websocket from '../src/websocket.ts';
import { id, init } from '../src/app.ts'
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mockCanvas, } from './setup.ts';
import { websocketReceiver } from '../src/websocket/websocketReceiver.ts';

const MATCH_ROOM = { status: 200, message: "MATCH_ROOM" };

const GAME_ROOM = {
	"status": 200,
	"message": "GAME_ROOM",
	"payload": {
		"message": "a584015a-ec23-427d-b19d-732ae868aeaa vs 57ae9a3c-1b1c-493e-8706-ced55f639e65"
	},
	"side": "RIGHT",
	"id": "57ae9a3c-1b1c-493e-8706-ced55f639e65"
}

const GAME_OVER = {
	"status": 200,
	"message": "GAME_OVER",
	"payload": {
		"winner": "a584015a-ec23-427d-b19d-732ae868aeaa",
		"message": "YOU LOSE!"
	},
	"finalScore": {
		"userX": 2,
		"userY": 0
	}
}

var server: WS;
var client: WebSocket;

beforeEach(async () => {
	server = new WS('ws://localhost:1234');
	client = new WebSocket('ws://localhost:1234');
	vi.spyOn(websocket, 'getSocket').mockReturnValue(client);
	await server.connected;
	// spyOn socket.addEventListener

	// Mock getSocket to return the client

	websocketReceiver(client);
	vi.spyOn(client, 'addEventListener');
	mockCanvas();
	id.username = 'testuser';
	id.id = 1;
	document.body.innerHTML = '<div id="root"></div>';
	init();
});
describe('WebSocket tests', () => {

	it('Match queue', async () => {

	});
});
