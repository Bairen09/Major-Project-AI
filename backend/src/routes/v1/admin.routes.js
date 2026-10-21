const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const adminStaffController = require('../../controllers/adminStaff.controller');
const ticketController = require('../../controllers/ticket.controller');
const protectAdmin = require('../../middleware/protectAdmin');
const validateRequest = require('../../middleware/validateRequest');
const { createStaffValidator } = require('../../validators/supportAuth.validators');

// All admin routes must be protected
router.use(protectAdmin);

const blogRoutes = require('./blog.routes');
router.use('/blogs', (req, res, next) => {
    req.business = { _id: 'localboost', name: 'LocalBoost Platform' };
    req.businessRole = 'owner';
    next();
}, blogRoutes);

router.get('/dashboard', adminController.getDashboard);
router.get('/platform', adminController.getPlatformStatus);

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/status', adminController.updateUserStatus);

router.get('/businesses', adminController.getBusinesses);
router.get('/businesses/:id', adminController.getBusinessDetails);
router.patch('/businesses/:id/status', adminController.updateBusinessStatus);
router.delete('/businesses/:id', adminController.deleteBusiness);

router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);

// ─── Subscriptions ────────────────────────────────────────────────────────────

const adminSubscriptionController = require('../../controllers/adminSubscription.controller');

router.get('/subscriptions', adminSubscriptionController.getSubscriptions);
router.get('/subscriptions/stats', adminSubscriptionController.getSubscriptionStats);
router.patch('/subscriptions/:id/plan', adminSubscriptionController.updateSubscriptionPlan);

// ─── Platform Ticket Stats ────────────────────────────────────────────────────
// Removed as per simplification to a single master support account

module.exports = router;

