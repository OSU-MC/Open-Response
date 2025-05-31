# Open-Response Socket
Welcome to the Open-Response WebSocket! This README.md is dedicated to development guidance and information reguarding the websocket side of the application. For more information about contributing, or general user guides, please visit the [Open-Response Wiki](https://github.com/OSU-MC/Open-Response/wiki).

## Project Structure
This WebSocket server is built using:

Node.js
Socket.IO
Express
[Docker](#docker)

## Dependencies

| Package     | Version    |
|-------------|------------|
| [`express`](https://www.npmjs.com/package/express)   | ^5.1.0     |
| [`socket.io`](https://www.npmjs.com/package/socket.io) | ^4.7.2     |


## Install Dependencies

```
npm install
```

## Run the websocket

```
npm run start
```

## Containerize the websocket

```
docker build -t openresponse_socket ./socket
```

## Running the containers

```
docker stack deploy -c docker-stack.yml openresponse
```

## Deleting the container

```
docker service rm openresponse_socket
```

