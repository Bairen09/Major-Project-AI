// src/routes/v1/auth.routes.js

const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth.controller');
const validateRequest = require('../../middleware/validateRequest');
const protect = require('../../middleware/protect');

const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require('../../validators/auth.validators');

// Public routes
router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);

module.exports = router;