// src/routes/v1/post.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const postController = require('../../controllers/post.controller');
const validateRequest = require('../../middleware/validateRequest');
const protect = require('../../middleware/protect');
const requireBusiness = require('../../middleware/requireBusiness');
const requirePost = require('../../middleware/requirePost');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');

const {
    generatePostsValidator,
    savePostValidator,
    updatePostValidator,
} = require('../../validators/post.validators');

const schedulerController = require('../../controllers/scheduler.controller');
const { schedulePostValidator } = require('../../validators/schedule.validators');

// All post routes require authentication and business ownership
router.use(protect);
router.use(requireBusiness);

// ─── Generate ─────────────────────────────────────────────────────────────────

router.post(
    '/generate',
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    generatePostsValidator,
    validateRequest,
    postController.generatePosts
);

// ─── Collection ───────────────────────────────────────────────────────────────

router.post(
    '/',
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    savePostValidator,
    validateRequest,
    postController.savePost
);

router.get('/', postController.listPosts);

// ─── Single Post ──────────────────────────────────────────────────────────────

router.get(
    '/:postId',
    requirePost,
    postController.getPost
);

router.patch(
    '/:postId',
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    requirePost,
    updatePostValidator,
    validateRequest,
    postController.updatePost
);

router.delete(
    '/:postId',
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    requirePost,
    postController.deletePost
);

// ─── Duplicate ────────────────────────────────────────────────────────────────

router.post(
    '/:postId/duplicate',
    requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
    requirePost,
    postController.duplicatePost
);

// ─── Scheduling ───────────────────────────────────────────────────────────────

router.patch(
    '/:postId/schedule',
    requirePost,
    schedulePostValidator,
    validateRequest,
    schedulerController.schedulePost
);

router.patch(
    '/:postId/unschedule',
    requirePost,
    schedulerController.unschedulePost
);

// ─── Image Generation ─────────────────────────────────────────────────────────

router.post(
    '/:postId/generate-image',
    requirePost,
    postController.generateImage
);

router.post(
    '/:postId/regenerate-image',
    requirePost,
    postController.regenerateImage
);

module.exports = router;