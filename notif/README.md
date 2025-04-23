# Setting Up the Notification Service

### Step 1: Open a WSL Console
Open a WSL console.

### Step 2: Install Dependencies
Navigate to the Core directory and install all dependencies:

```
cd core
npm install
```

### Step 3: Get VAPID Keys
VAPID (Voluntary Application Server Identity) keys allow for the sending and recieving of web notifications without the use of external services.
The keys need to be initialized in order to use the notification microservices.

First, run the following:

```
npm run notif:keygen
```

Your VAPID keys should now be displayed in the console.

### Step 4: Set VAPID Keys

Now, go to the `server.js` file under `Open-Response/core/notif` in your IDE and replace the `publicVapidKey` and `privateVapidKey` constants with your own. 

You will also need to change the `publicVapidKey` constant in the `index.html` file under `Open-Response/core/notif/client`.

### Step 5: Test Notification Service
To verify that the service has been set up correctly, run the following while still being under `Open-Response/core` in your console:

```
npm run notif:basics
```

There should now be a localhost link in your console for you to follow. If this is not the case, go to your browser of choice and enter the following:

```
http://localhost:8888
```

Now in the browser there should be a popup asking for notification permissions. If you do not see this immediately, try the following:

* **Firefox**: Look to the navigation bar to see if there is a small speech bubble icon. If there is, click it and enable notifications. Otherwise, check your notification settings in the Firefox settings.

* **Chrome**: There may be a small lock icon in the navigation bar which will display the popup once clicked. If not, check your site and general chrome settings/permissions.

* **Edge**: There may be a small bell icon in the navigation bar which will display the popup once clicked. If not, check your site and general edge settings/permissions.

Upon allowing notifications, a notification should be pushed to your system. If not, try reloading the page.

