// src/validators/schedule.validators.js

const { body } = require('express-validator');

// ─── Schedule Post Validator ───────────────────────────────────────────────────

const schedulePostValidator = [
    body('scheduledAt')
        .notEmpty()
        .withMessage('scheduledAt is required')
        .isISO8601()
        .withMessage('scheduledAt must be a valid ISO 8601 datetime (e.g. 2026-07-10T10:30:00Z)')
        .custom((value) => {
            const scheduledDate = new Date(value);
            if (scheduledDate <= new Date()) {
                throw new Error('scheduledAt must be a date in the future');
            }
            return true;
        }),
];

module.exports = { schedulePostValidator };
