import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PingPong } from '../classes/PingPong.js';
import { gameRoom } from '../state/gameRoom.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';

// Mock WebSocket
class MockSocket  {
    send = vi.fn();
    readyState = 1;
    on = vi.fn();
    off = vi.fn();
    close = vi.fn();
}

describe('PingPong Game', () => {
    let socket1: MockSocket;
    let socket2: MockSocket;
    let game: PingPong;

    beforeEach(() => {
        // Reset rooms and mocks
        connectedRoomInstance.clear();

        socket1 = new MockSocket();
        socket2 = new MockSocket();

        connectedRoomInstance.addUser('player1');
        connectedRoomInstance.addUser('player2');

		connectedRoomInstance.addWebsocket('player1', socket1 as any);
		connectedRoomInstance.addWebsocket('player2', socket2 as any);

        game = new PingPong('match-1');
        game.createMatch('player1', 'player2');
    });

    it('should start the match and set players to GAME_ROOM', () => {
        expect(socket1.send).toHaveBeenCalledWith(expect.stringContaining('GAME_ROOM'));
        expect(socket2.send).toHaveBeenCalledWith(expect.stringContaining('GAME_ROOM'));
        expect(connectedRoomInstance.getById('player1')?.status).toBe('GAME_ROOM');
        expect(connectedRoomInstance.getById('player2')?.status).toBe('GAME_ROOM');

        // Verify gameRoom
        expect(gameRoom.size).toBe(1);
    });

    it('should play and end the game successfully', () => {
        // Simulate some player inputs
        game.updatePlayerInput('player1', { up: true, down: false });
        expect(game.inputs.get('player1')).toEqual({ up: true, down: false });
        expect(game.inputs.get('player2')).toEqual({ up: false, down: false });

        // Simulate player X winning
        game.gameState.userX.score = 2; // WIN_SCORE
        game.update(); // triggers endMatch


        expect(game.matchState).toBe('ENDED');
        expect(game.winnerId).toBe('player1');
        expect(game.loserId).toBe('player2');

        // Verify both players received GAME_OVER message
        expect(socket1.send).toHaveBeenCalledWith(expect.stringContaining('GAME_OVER'));
        expect(socket2.send).toHaveBeenCalledWith(expect.stringContaining('GAME_OVER'));

        // Verify loser returned to CONNECT_ROOM
        expect(connectedRoomInstance.getById('player2')?.status).toBe('CONNECT_ROOM');
        expect(connectedRoomInstance.getById('player1')?.status).toBe('CONNECT_ROOM');
    });

});

describe('PingPong Game - Disconnects', () => {
    let socket1: MockSocket;
    let socket2: MockSocket;
    let game: PingPong;

    beforeEach(() => {
        connectedRoomInstance.clear();

        socket1 = new MockSocket();
        socket2 = new MockSocket();

        connectedRoomInstance.addUser('player1');
        connectedRoomInstance.addUser('player2');

		connectedRoomInstance.addWebsocket('player1', socket1 as any);
		connectedRoomInstance.addWebsocket('player2', socket2 as any);

        game = new PingPong('match-1');
        game.createMatch('player1', 'player2');
    });

    it('should handle one player disconnecting mid-game', () => {
        // simulate game starting
        game.matchState = 'PLAYING';
        // disconnect player2
        game.disconnect('player1');
        connectedRoomInstance.disconnect('player1');

        // set player2 score to trigger win condition
        game.gameState.userX.score = 2;

        // update game state
        game.update();

        // The game should mark itself as ended
        expect(game.matchState).toBe('ENDED');

        // Player2 should be declared the winner
        expect(game.winnerId).toBe('player1');
    });

    it('Two disconnected with one winner', () => {
        // simulate game starting
        game.matchState = 'PLAYING';

        game.update();

        // disconnect both players
        game.disconnect('player1');
        game.disconnect('player2');
        connectedRoomInstance.disconnect('player1');

        // set player1 score to trigger win condition
        game.gameState.userX.score = 1;
        game.update();

        // The game should mark itself as ended
        expect(game.matchState).toBe('ENDED');
        // Player1 should be declared the winner
        expect(game.winnerId).toBe('player1');

    });
});
