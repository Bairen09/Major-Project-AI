// src/validators/prompt.validators.js

const { param } = require('express-validator');

// ─── Favorite Prompt Validator ─────────────────────────────────────────────────

const favoritePromptValidator = [
  param('promptId')
    .isMongoId()
    .withMessage('promptId must be a valid MongoDB ObjectId'),
];

// ─── Reuse Prompt Validator ────────────────────────────────────────────────────

const reusePromptValidator = [
  param('promptId')
    .isMongoId()
    .withMessage('promptId must be a valid MongoDB ObjectId'),
];

module.exports = { favoritePromptValidator, reusePromptValidator };
