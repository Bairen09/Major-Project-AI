// src/routes/v1/business.routes.js

const express = require('express');
const router = express.Router();

const businessController = require('../../controllers/business.controller');
const schedulerController = require('../../controllers/scheduler.controller');
const postController = require('../../controllers/post.controller');
const mediaController = require('../../controllers/media.controller');
const upload = require('../../middleware/upload');
const validateRequest = require('../../middleware/validateRequest');
const protect = require('../../middleware/protect');
const requireBusiness = require('../../middleware/requireBusiness');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');
const postRoutes = require('./post.routes');
const promptRoutes = require('./prompt.routes');
const teamRoutes = require('./team.routes');
const assistantRoutes = require('./assistant.routes');
const blogRoutes = require('./blog.routes');

const {
    createBusinessValidator,
    updateBusinessValidator,
    updateSettingsValidator,
} = require('../../validators/business.validators');

// All business routes require authentication
router.use(protect);

// Mount routes
router.use('/:id/posts', requireBusiness, postRoutes);
router.use('/:id/prompts', requireBusiness, promptRoutes);
router.use('/:id/team', teamRoutes);
router.use('/:id/assistant', assistantRoutes);
router.use('/:id/blogs', requireBusiness, blogRoutes);

// ─── Collection Routes ────────────────────────────────────────────────────────

router.post(
    '/',
    createBusinessValidator,
    validateRequest,
    businessController.createBusiness
);

router.get('/mine', businessController.getMyBusinesses);

// ─── Single Business Routes ───────────────────────────────────────────────────

router.get('/:id', requireBusiness, businessController.getBusiness);

router.patch(
    '/:id',
    requireBusiness,
    requireRole(ROLES.OWNER, ROLES.ADMIN),
    updateBusinessValidator,
    validateRequest,
    businessController.updateBusiness
);

router.delete('/:id', requireBusiness, requireRole(ROLES.OWNER), businessController.deleteBusiness);

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get(
    '/:id/dashboard/summary',
    requireBusiness,
    businessController.getDashboardSummary
);

router.get(
    '/:id/analytics',
    requireBusiness,
    businessController.getAnalytics
);

// ─── Post Media ───────────────────────────────────────────────────────────────

router.post(
    '/:id/posts/:postId/media',
    requireBusiness,
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    upload.single('image'),
    mediaController.uploadMedia
);

router.delete(
    '/:id/posts/:postId/media/:publicId',
    requireBusiness,
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    mediaController.deleteMedia
);

// ─── Business Media (Logo & Cover) ─────────────────────────────────────────────

router.post(
    '/:id/logo',
    requireBusiness,
    requireRole(ROLES.OWNER),
    upload.single('image'),
    businessController.uploadLogo
);

router.delete(
    '/:id/logo',
    requireBusiness,
    requireRole(ROLES.OWNER),
    businessController.deleteLogo
);

router.post(
    '/:id/cover',
    requireBusiness,
    requireRole(ROLES.OWNER),
    upload.single('image'),
    businessController.uploadCoverImage
);

router.delete(
    '/:id/cover',
    requireBusiness,
    requireRole(ROLES.OWNER),
    businessController.deleteCoverImage
);

// ─── Settings ─────────────────────────────────────────────────────────────────

router.get(
    '/:id/settings',
    requireBusiness,
    businessController.getSettings
);

router.patch(
    '/:id/settings',
    requireBusiness,
    updateSettingsValidator,
    validateRequest,
    businessController.updateSettings
);

// ─── Members ──────────────────────────────────────────────────────────────────

router.get('/:id/members', requireBusiness, businessController.getMembers);

// ─── Calendar ───────────────────────────────────────────────────────────────

router.get('/:id/calendar', requireBusiness, schedulerController.getCalendar);

module.exports = router;