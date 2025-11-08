import fetch from "node-fetch";

async function testGetUser() {
  const id = 1;
  const response = await fetch(`http://localhost:3000/user/${id}/friends`, 
    {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

  const data = await response.json();
  console.log("Reply server :", data);
}

testGetUser();