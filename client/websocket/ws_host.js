import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket host is running on ws://localhost:8080');

let clientId = 0;
const clients = new Map();

server.on('connection', (socket) => {
	const id = ++clientId;
	clients.set(id, socket);
	console.log(`Client connected: ${id}`);

	socket.send(JSON.stringify({ id: clientId, clients: Array.from(clients.keys()) }));

	broadcastClients();

	socket.on('close', () => {
		clients.delete(id);
		console.log(`Client disconnected: ${id}`);
		broadcastClients();
	});
});

function broadcastClients() {
	const clientIds = Array.from(clients.keys());
	const message = JSON.stringify({ clients: clientIds });
	clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});
}