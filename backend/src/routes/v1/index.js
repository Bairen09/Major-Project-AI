// src/routes/v1/index.js

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const businessRoutes = require('./business.routes');
const postRoutes = require('./post.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const publicRoutes = require('./public.routes');
const ticketRoutes = require('./ticket.routes');
const supportRoutes = require('./support.routes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/businesses', businessRoutes);
router.use('/businesses/:id/posts', postRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/tickets', ticketRoutes);
router.use('/support', supportRoutes);

module.exports = router;