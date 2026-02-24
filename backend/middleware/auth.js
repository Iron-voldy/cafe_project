// JWT authentication middleware
const jwt = require('jsonwebtoken');
require('dotenv').config();

// verify token middleware
const authMiddleware = (req, res, next) => {
    try {
        // get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        // verify token and attach user to request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// admin role check middleware
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
