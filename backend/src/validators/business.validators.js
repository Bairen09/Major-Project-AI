// src/validators/business.validators.js

const { body } = require('express-validator');
const BUSINESS_CATEGORIES = require('../constants/businessCategories');

// ─── Create Business ──────────────────────────────────────────────────────────

const createBusinessValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Business name is required')
        .isLength({ min: 2 })
        .withMessage('Business name must be at least 2 characters')
        .isLength({ max: 100 })
        .withMessage('Business name cannot exceed 100 characters'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Business category is required')
        .isIn(BUSINESS_CATEGORIES)
        .withMessage(`Category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`),

    body('industry')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Industry cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('location.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),

    body('location.state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State cannot exceed 100 characters'),

    body('location.country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country cannot exceed 100 characters'),

    body('services')
        .optional()
        .isArray()
        .withMessage('Services must be an array'),

    body('services.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Each service must be a non-empty string'),
];

// ─── Update Business ──────────────────────────────────────────────────────────

const updateBusinessValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Business name must be at least 2 characters')
        .isLength({ max: 100 })
        .withMessage('Business name cannot exceed 100 characters'),

    body('category')
        .optional()
        .trim()
        .isIn(BUSINESS_CATEGORIES)
        .withMessage(`Category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`),

    body('industry')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Industry cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('location.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),

    body('location.state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State cannot exceed 100 characters'),

    body('location.country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country cannot exceed 100 characters'),

    body('services')
        .optional()
        .isArray()
        .withMessage('Services must be an array'),

    body('services.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Each service must be a non-empty string'),
];

// ─── Update Settings ──────────────────────────────────────────────────────────

const updateSettingsValidator = [
    body('tone')
        .optional()
        .trim()
        .isIn(['professional', 'friendly', 'luxury', 'fun', 'casual'])
        .withMessage('Tone must be one of: professional, friendly, luxury, fun, casual'),

    body('timezone')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Timezone cannot be empty'),

    body('language')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Language cannot be empty'),

    body('targetAudience')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Target audience cannot exceed 200 characters'),

    body('autoApprovePosts')
        .optional()
        .isBoolean()
        .withMessage('autoApprovePosts must be a boolean'),

    body('postingPreferences.preferredDays')
        .optional()
        .isArray()
        .withMessage('Preferred days must be an array'),

    body('postingPreferences.preferredDays.*')
        .optional()
        .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Each preferred day must be a valid weekday'),

    body('postingPreferences.preferredTime')
        .optional()
        .trim()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Preferred time must be in HH:MM format'),

    // Root fields mixed in settings payload
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    body('category')
        .optional()
        .trim()
        .isIn(BUSINESS_CATEGORIES)
        .withMessage(`Category must be one of: ${BUSINESS_CATEGORIES.join(', ')}`),
    body('industry')
        .optional()
        .trim()
        .isLength({ max: 100 }),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }),
    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage('Must be a valid email'),
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[\+\d\s\-\(\)]{7,20}$/)
        .withMessage('Phone must be a valid phone number'),
    body('logoUrl')
        .optional({ checkFalsy: true })
        .trim()
        .isURL()
        .withMessage('Logo must be a valid URL'),

    // Location
    body('location.address')
        .optional()
        .trim()
        .isLength({ max: 200 }),
    body('location.city')
        .optional()
        .trim()
        .isLength({ max: 100 }),
    body('location.state')
        .optional()
        .trim()
        .isLength({ max: 100 }),
    body('location.country')
        .optional()
        .trim()
        .isLength({ max: 100 }),

    // Services
    body('services')
        .optional()
        .isArray(),

    // Brand Colors
    body('settings.brandColors')
        .optional()
        .isArray(),
    body('settings.brandColors.*')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Brand color must be a valid hex code'),

    // Social Links
    body('settings.socialLinks.instagram').optional({ checkFalsy: true }).trim().isURL({ require_protocol: false }).withMessage('Instagram must be a valid URL'),
    body('settings.socialLinks.facebook').optional({ checkFalsy: true }).trim().isURL({ require_protocol: false }).withMessage('Facebook must be a valid URL'),
    body('settings.socialLinks.linkedin').optional({ checkFalsy: true }).trim().isURL({ require_protocol: false }).withMessage('LinkedIn must be a valid URL'),
    body('settings.socialLinks.website').optional({ checkFalsy: true }).trim().isURL({ require_protocol: false }).withMessage('Website must be a valid URL'),
];

module.exports = {
    createBusinessValidator,
    updateBusinessValidator,
    updateSettingsValidator,
};