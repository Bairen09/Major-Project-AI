// src/routes/v1/notification.routes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const protect = require('../../middleware/protect');

router.use(protect); // All notification routes require authentication

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead); // Must be before /:id/read
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
