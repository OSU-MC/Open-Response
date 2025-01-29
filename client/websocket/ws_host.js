import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket host is running on ws://localhost:8080');

let clientId = 0;
const clients = new Map();

// Upon connection, create new client id and send it to the connected client
server.on('connection', (socket) => {
	const id = ++clientId;
	clients.set(id, socket);
	console.log(`Client connected: ${id}`);

	socket.send(JSON.stringify({ id: clientId, clients: Array.from(clients.keys()) }));

	// Notify all clients of the new client
	broadcastClients();

	// Remove client from map upon disconnect
	socket.on('close', () => {
		clients.delete(id);
		console.log(`Client disconnected: ${id}`);

		// Notify all clients of departed client
		broadcastClients();
	});
});

// Send connected clients an array of connected client ids
function broadcastClients() {
	const clientIds = Array.from(clients.keys());
	const message = JSON.stringify({ clients: clientIds });
	clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});
}