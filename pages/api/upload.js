import { writeFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const filename = `audio_${Date.now()}.mp3`;
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    await writeFile(filePath, buffer);
    res.status(200).json({ url: `/uploads/${filename}` });
  }
}

// server.js (WebSocket Server)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });
});