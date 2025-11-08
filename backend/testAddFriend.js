import fetch from "node-fetch";

async function testAddFriend() {
  const userId = 1;
  const friendId = 2;

  const response = await fetch(`http://localhost:3000/user/${userId}/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friend_id: friendId })
  });

  const data = await response.json();
  console.log('Reply server:', data);
}

testAddFriend()