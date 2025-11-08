import fetch, { Headers } from 'node-fetch';

async function testLogin()
{
    const response = await fetch ('http://localhost:3000/login',
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(
        {
            email: 'julien@hotmail.com',
            username: 'julien',
            password: 'pass'

        })
    });
    const data = await response.json();
    console.log('Reply server :', data);
};

testLogin();



