const redis = require('redis');

const PORT = 6380;
const client = redis.createClient({
    legacyMode: true,
    socket: {
        port: PORT,
    }
});

client.connect().catch(console.error);

client.on('connect', function() {
    console.log('Redis connection successful');
    connectionBasics();
});

async function connectionBasics () {
    client.set('user:1', 'Student', function(err, reply) {
        console.log(reply);
    });

    client.get('user:1', function(err, reply) {
        console.log(reply);
    });

    client.exists('user:1', 'Student', function(err, reply) {
        console.log(reply);
    });

    client.del('user:1', function(err, reply) {
        console.log(reply);
    });
}