import WebSocket from 'ws';

const socket = new WebSocket('ws://localhost:8080');

socket.on('open', () => {
	console.log('Connected to the WebSocket host');
});

socket.on('message', (message) => {
	try {
		const data = JSON.parse(message);

		if (data.id !== undefined) {
			console.log(`Assigned Client ID: ${data.id}`);
		}

		if (data.clients) {
			console.log(`Connected Clients: ${data.clients.join(', ')}`);
		}
	} catch (error) {
		console.error('Error parsing message:', error);
	}
});

socket.on('close', () => {
	console.log('Disconnected from the WebSocket host');
});

socket.on('error', (error) => {
	console.error('WebSocket error:', error);
});
