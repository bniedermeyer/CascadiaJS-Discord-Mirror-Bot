const jwt = require('jsonwebtoken');

const secret = process.env.TOKEN_SECRET;

const token = jwt.sign({}, secret, { issuer: 'CascadiaJS 2021' });
console.log(token)