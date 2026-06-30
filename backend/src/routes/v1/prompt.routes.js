// src/routes/v1/prompt.routes.js
// Mounted at: /businesses/:id/prompts (mergeParams: true)

const express = require('express');
const router = express.Router({ mergeParams: true });

const promptController = require('../../controllers/prompt.controller');
const validateRequest = require('../../middleware/validateRequest');
const protect = require('../../middleware/protect');
const requireBusiness = require('../../middleware/requireBusiness');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');

const { favoritePromptValidator, reusePromptValidator } = require('../../validators/prompt.validators');

// All prompt routes require authentication and a valid business
router.use(protect);
router.use(requireBusiness);

// ─── History ──────────────────────────────────────────────────────────────────
// GET /businesses/:id/prompts

router.get('/', promptController.listPrompts);

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
// PATCH /businesses/:id/prompts/:promptId/favorite

router.patch(
  '/:promptId/favorite',
  requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
  favoritePromptValidator,
  validateRequest,
  promptController.toggleFavorite
);

// ─── Reuse Prompt ─────────────────────────────────────────────────────────────
// POST /businesses/:id/prompts/:promptId/reuse

router.post(
  '/:promptId/reuse',
  requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR),
  reusePromptValidator,
  validateRequest,
  promptController.reusePrompt
);

module.exports = router;
