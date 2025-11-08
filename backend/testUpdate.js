import fetch from "node-fetch";

const userId = 1;

async function testUpdate()
{
    const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: 'nolcdsaadsadq@hotmail.fr',
            username:'usevddsars',
            Password: 'pavddsssipos'
        })
    });

    const data = await response.json();
    console.log(data);
}

testUpdate();