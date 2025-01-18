const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const PORT = 8888;

const app = express();

const publicVapidKey = "BDWLp6VBKr3geSNPBsyBYk3_2a85bhFD94057-AZSzCjykQ9__KiCTfrZqNcI2Ae5uBBIhPuIYkK4aN2S6ygIkI";
const privateVapidKey = "D_HDsLbox1m04vu-esrLb1jULAZY4GanlYWxfi9z7r8";

// create express app
app.use(bodyParser.json());         

app.use(express.static(path.join(__dirname, "client")))

// set vapid details (you can enter your own email but it's unnecessary)
webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    res.status(201).json({});
    const payload = JSON.stringify({ title: "Notification Test", body: "Hello World" });

    webpush.sendNotification(subscription, payload).catch(console.log);
})

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
    console.log("http://localhost:" + PORT);
});
