import fetch from 'node-fetch';

async function testMatches() 
{
  const response = await fetch('http://localhost:3000/match', 
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify
    ({
        player1_id: 1,
        player2_id: 2,
    }),
  });

  const data = await response.json();
  console.log('Reply server :', data);
}

testMatches();