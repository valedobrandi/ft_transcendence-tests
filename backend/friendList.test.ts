import { describe, it, expect, vi, beforeAll } from "vitest";
import { fastify } from "../src/server.js";
import { userMock } from "./Mock.js";
import { createSchema } from "../database/schema.js";
import { seedUsers } from "../database/seeds/seed_users.js";
import { connectedRoomInstance } from "../src/state/ConnectedRoom.js";


function reset_database() {
    createSchema();
    seedUsers();
}

describe("FRIEND LIST TEST", () => {
    reset_database();
    var response;
    fastify.addHook('onRequest', async (request, response) => {
        request.jwtVerify = async () => ({ userId: userMock["alice"].id });
    });

    it("01 - ADD A USER TO THE FRIEND LIST", async () => {
        connectedRoomInstance.addUser(userMock["alice"].username, userMock["alice"].id);

        response = await fastify.inject({
            method: "POST",
            url: "/add-friend?id=" + userMock["bob"].id.toString(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toBe('success');

        const user = connectedRoomInstance.getById(userMock["alice"].id);
        expect(user?.friendSet.has(userMock["bob"].id)).toBe(true);

    });

    it("02 - GET FRIEND LIST", async () => {
        response = await fastify.inject({
            method: "GET",
            url: "/friends-list",
        });

        expect(response.statusCode).toBe(200);

        const data = response.json();
        expect(data.payload).toContain(userMock["bob"].id);
    });

    it("03 - REMOVE A USER FROM THE FRIEND LIST", async () => {
        connectedRoomInstance.addUser(userMock["alice"].username, userMock["alice"].id);
        const user = connectedRoomInstance.getById(userMock["alice"].id);
        user?.friendSet.add(userMock["bob"].id);

        response = await fastify.inject({
            method: "DELETE",
            url: "/remove-friend?id=" + userMock["bob"].id.toString(),
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().message).toBe('success');

        expect(user?.friendSet.has(userMock["bob"].id)).toBe(false);
    });

    it("04 - ADD A USER TO THE FRIEND LIST (VALIDATION FAILURE)", async () => {
        response = await fastify.inject({
            method: "POST",
            url: "/add-friend",
        });
        expect(response.statusCode).toBe(400);
    });

    it("05 - REMOVE A USER FROM THE FRIEND LIST (VALIDATION FAILURE)", async () => {
        response = await fastify.inject({
            method: "DELETE",
            url: "/remove-friend",
        });
        expect(response.statusCode).toBe(400);
    });
});
