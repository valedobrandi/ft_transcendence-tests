// websocket.test.ts
import { describe, it, expect } from "vitest";
import { fastify } from "../src/server.js";
import { userMock } from "./Mock.js";

import { connectedRoomInstance } from "../src/state/connectedRoom.js";

describe("TABLE CHATBLOCK TEST", () => {
  it("01 - ADD A USER TO THE BLOCK LIST", async () => {
    await fastify.inject({
      method: "POST",
      url: "/block-user",
      body: {
        userId: userMock["alice"].id,
        blockedUserId: userMock["bob"].id,
      },
    });
  });

  it("02 - GET BLOCKED USERS", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/blocked-users",
      query: {
        userId: userMock["alice"].id.toString(),
      },
    });
    
    expect(response.statusCode).toBe(200);
    
    const data = response.json();
  
    // expect(data).toBe({});

    expect(data.payload).toContain(userMock["bob"].id);
  });

  it("03 - REMOVE A USER FROM THE BLOCK LIST", async () => {
    var response;

    // Add alice to connectedRoomInstances
    connectedRoomInstance.addUser(userMock["alice"].username, userMock["alice"].id);
    // Get Alice's chat manager and add blocked users
    const alice = connectedRoomInstance.getByName(userMock["alice"].username);
    alice?.chat.addToBlockedUsers([userMock["bob"].id]);
    
    response = await fastify.inject({
      method: "DELETE",
      url: "/unblock-user",
      body: {
        userId: userMock["alice"].id,
        blockedUserId: userMock["bob"].id,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(alice?.chat.isUserBlocked(userMock["bob"].id)).toBe(false);

    response = await fastify.inject({
      method: "GET",
      url: "/blocked-users",
      query: {
        userId: userMock["alice"].id.toString(),
      },
    }); 

    expect(response.statusCode).toBe(400);

  });

  it("04 - ADD A USER TO THE BLOCK LIST (VALIDATION FAILURE)", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/block-user",
      body: {
        userId: userMock["alice"].id,
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it("05 - REMOVE A USER FROM THE BLOCK LIST (VALIDATION FAILURE)", async () => {
    const res = await fastify.inject({
      method: "DELETE",
      url: "/unblock-user",
      body: {
        userId: userMock["alice"].id,
      },
    });
    expect(res.statusCode).toBe(400);
  });
});
