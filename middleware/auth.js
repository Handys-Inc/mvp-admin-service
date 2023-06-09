require("dotenv").config();
const jwt = require('jsonwebtoken');


function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided');
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.admin = decoded;
        next();
    } catch (ex) {
        console.log('ex', ex)
        return res.status(400).send('invalid token');
    }
}

module.exports = auth;