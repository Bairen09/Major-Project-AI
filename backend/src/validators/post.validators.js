// src/validators/post.validators.js

const { body } = require('express-validator');
const PLATFORMS = require('../constants/platforms');
const POST_STATUS = require('../constants/postStatus');

// ─── Generate Posts ───────────────────────────────────────────────────────────

const generatePostsValidator = [
    body('platform')
        .trim()
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(Object.values(PLATFORMS))
        .withMessage(`Platform must be one of: ${Object.values(PLATFORMS).join(', ')}`),

    body('goal')
        .trim()
        .notEmpty()
        .withMessage('Goal is required')
        .isIn(['awareness', 'leads', 'sales', 'engagement'])
        .withMessage('Goal must be one of: awareness, leads, sales, engagement'),

    body('tone')
        .optional()
        .trim()
        .isIn(['professional', 'friendly', 'luxury', 'fun', 'casual'])
        .withMessage('Tone must be one of: professional, friendly, luxury, fun, casual'),

    body('audience')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Audience cannot exceed 200 characters'),

    body('topic')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Topic cannot exceed 200 characters'),

    body('count')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Count must be a number between 1 and 10'),
];

// ─── Save Post ────────────────────────────────────────────────────────────────

const savePostValidator = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Post content is required')
        .isLength({ max: 2200 })
        .withMessage('Content cannot exceed 2200 characters'),

    body('platform')
        .trim()
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(Object.values(PLATFORMS))
        .withMessage(`Platform must be one of: ${Object.values(PLATFORMS).join(', ')}`),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Title cannot exceed 150 characters'),

    body('hashtags')
        .optional()
        .isArray()
        .withMessage('Hashtags must be an array'),

    body('hashtags.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Each hashtag must be a non-empty string'),

    body('mediaUrls')
        .optional()
        .isArray()
        .withMessage('Media URLs must be an array'),

    body('mediaUrls.*')
        .optional()
        .trim()
        .isURL()
        .withMessage('Each media URL must be a valid URL'),

    body('aiGenerated')
        .optional()
        .isBoolean()
        .withMessage('aiGenerated must be a boolean'),
];

// ─── Update Post ──────────────────────────────────────────────────────────────

const updatePostValidator = [
    body('content')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Content cannot be empty')
        .isLength({ max: 2200 })
        .withMessage('Content cannot exceed 2200 characters'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Title cannot exceed 150 characters'),

    body('platform')
        .optional()
        .trim()
        .isIn(Object.values(PLATFORMS))
        .withMessage(`Platform must be one of: ${Object.values(PLATFORMS).join(', ')}`),

    body('hashtags')
        .optional()
        .isArray()
        .withMessage('Hashtags must be an array'),

    body('hashtags.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Each hashtag must be a non-empty string'),

    body('mediaUrls')
        .optional()
        .isArray()
        .withMessage('Media URLs must be an array'),

    body('mediaUrls.*')
        .optional()
        .trim()
        .isURL()
        .withMessage('Each media URL must be a valid URL'),

    body('status')
        .optional()
        .trim()
        .isIn([POST_STATUS.DRAFT])
        .withMessage('Only draft status can be set manually. Scheduled and published are managed by the system.'),
];

module.exports = {
    generatePostsValidator,
    savePostValidator,
    updatePostValidator,
};