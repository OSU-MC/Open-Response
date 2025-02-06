const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = 8888;

const app = express();

// Replace with your generated VAPID keys
const publicVapidKey = "";
const privateVapidKey = "";

// Create express app
app.use(bodyParser.json());         

app.use(express.static(path.join(__dirname, "client")))

// Set vapid details (you can enter your own email but it's unnecessary)
webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    res.status(201).json({});
    const payload = JSON.stringify({ title: "Notification Test", body: "Hello World" });

    // Send the notification to be handled by browser
    webpush.sendNotification(subscription, payload).catch(console.log);
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
    console.log("http://localhost:" + PORT);
});
