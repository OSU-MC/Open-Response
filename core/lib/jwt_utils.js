const jwt = require('jsonwebtoken')

function encode(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.APPLICATION_SECRET, { expiresIn: expiresIn })
}

function decode(token) {
    return jwt.verify(token, process.env.APPLICATION_SECRET)
}

exports.encode = encode
exports.decode = decode