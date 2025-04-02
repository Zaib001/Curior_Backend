const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const router = express.Router();

// Register Validation
router.post(
  '/register',
  validateRequest([
    body('name').isString().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'merchant', 'driver', 'hub_staff']).withMessage('Invalid role')
  ]),
  registerUser
);

// Login Validation
router.post(
  '/login',
  validateRequest([
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  loginUser
);

module.exports = router;
