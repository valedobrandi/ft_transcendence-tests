import type { WebSocket } from 'ws';
import db from '../database/db';
import { fastify } from "../src/server.js";
import MatchesModel from '../src/models/matchesModel.js';
import { GameEvents } from '../src/events/gameEvents.js';
import { createSchema } from '../database/schema.js';
import { seedUsers } from '../database/seeds/seed_users.js';

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
    await fastify.ready();
    const matchesModel = new MatchesModel(db);
    GameEvents.registerListeners(matchesModel);
    return fastify;
};


async function reset_database() {
  await createSchema();
  await seedUsers();
}

export { waitForMessage, fastifyServer, reset_database };