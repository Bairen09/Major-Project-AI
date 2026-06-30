// src/routes/v1/user.routes.js

const express = require('express');
const router = express.Router();

const userController = require('../../controllers/user.controller');
const teamController = require('../../controllers/team.controller');
const upload = require('../../middleware/upload');
const protect = require('../../middleware/protect');

// All user routes require authentication
router.use(protect);

router.get('/invitations', teamController.listUserInvitations);

router.post(
    '/avatar',
    upload.single('image'),
    userController.uploadAvatar
);

router.delete(
    '/avatar',
    userController.deleteAvatar
);

module.exports = router;
