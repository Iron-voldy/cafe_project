// User management routes - auth and profile endpoints
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../../../middleware/auth');

// register route with validation
router.post('/register', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// login route
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], login);

// get profile (authenticated)
router.get('/profile', authMiddleware, getProfile);

// update profile (authenticated)
router.put('/profile', authMiddleware, updateProfile);

// get all users (admin only)
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
