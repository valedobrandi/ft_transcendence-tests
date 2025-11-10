import type { WebSocket } from 'ws';
import { fastify } from '../server';
import MatchesModel from '../models/matchesModel';
import { getDatabase } from '../../database/db';
import { GameEvents } from '../events/gameEvents';

function waitForMessage(ws: WebSocket, field: string, type: string) {
    return new Promise((resolve) => {
        const handler = (data: WebSocket.Data) => {
            const msg = JSON.parse(data.toString());
            if (msg[field] === type) {
                ws.off('message', handler);
                resolve(msg);
            }
        };
        ws.on('message', handler);
    });
}

const fastifyServer = async () => {
    const db = getDatabase();
    await fastify.ready();
    const matchesModel = new MatchesModel(db);
    GameEvents.registerListeners(matchesModel);
    return fastify;
};

export { waitForMessage, fastifyServer };
