# Testing WebSockets

This guide will walk you through the process of testing the basic WebSocket implementation that will be used for development.

### Step 1: Open a WSL Console
Open a WSL console.

### Step 2: Install Dependencies
Navigate to the client directory:

```
cd MyClassroom/client
```

Install all dependencies:

```
npm install
```

### Step 3: Start the WebSocket host

Startup the host with the following command:

```
npm run ws:host
```

### Step 4: Test client connection functionality

There are a few options for this. The first being to open a new WSL console, navigate to the client directory and run the following:

```
npm run ws:client
```

This should display something similar to the following:

```
Connected to the WebSocket host
Assigned Client ID: 1
Connected Clients: 1
```

The second option is to open the ws_client.html file in your browser. This should display some text on the screen similar to this:

```
Client 1
    * Client ID: 1
```

The final option is to open the ws_host.html file in your browser. This has a similar view to the previous client file, but it
displays all connected clients and has a button to add another client which will open a new window/tab.