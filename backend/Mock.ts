export const userMock = {
    'alice': {
        id: 3,
        username: 'alice',
        password: 'hashed_password_1',
    },
    'bob': {
        id: 4,
        username: 'bob',
        password: 'hashed_password_2',
    }
}

export const chatMessagersMock = [{
    type: 'CHAT',
    senderId: userMock.alice.id,
    sender: userMock.alice.username,
    receiverId: userMock.bob.id,
    receiver: userMock.bob.username,
    message: "Hello"
}];
