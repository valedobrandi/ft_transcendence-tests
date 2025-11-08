import fetch from 'node-fetch';

async function testRegister() 
{
  const response = await fetch('http://localhost:3000/register', 
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jule@hotmail.com',
      username: 'jule',
      password: 'pass'
    })
  });

  const data = await response.json();
  console.log('Reply server :', data);
}

testRegister();