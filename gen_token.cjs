const jwt = require('jsonwebtoken');
const JWT_SECRET = 'dev-secret-change-me';
const phone = '0788000000@kora.rw';
const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '1h' });
console.log(token);
