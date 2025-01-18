// wait for a notification to be sent from the server
self.addEventListener('push', function(e) {
    const data = e.data.json();

    // push a notification with the recieved information
    self.registration.showNotification(
        data.title,
        {
            body: data.body,
        }
    );
})
