import type { WebSocket } from 'ws';

function waitForMessage(ws: WebSocket, field:string, type: string) {
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

  export { waitForMessage };

  