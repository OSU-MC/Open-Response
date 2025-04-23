const vapidKeys = require("web-push").generateVAPIDKeys();

for (let i = 0; i < 110; i ++) {
    process.stdout.write('=');
}

console.log('');
console.log(vapidKeys);

for (let i = 0; i < 110; i ++) {
    process.stdout.write('=');
}

console.log('\n');