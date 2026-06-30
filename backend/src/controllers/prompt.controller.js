// src/controllers/prompt.controller.js

const promptService = require('../services/prompt.service');
const { sendSuccess } = require('../utils/apiResponse');

const getMeta = (req) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.requestId,
});

// ─── List Prompts ─────────────────────────────────────────────────────────────
// GET /businesses/:id/prompts

const listPrompts = async (req, res, next) => {
  try {
    const data = await promptService.listPrompts(req.business._id);
    return sendSuccess(res, 'Prompt history fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
// PATCH /prompts/:promptId/favorite

const toggleFavorite = async (req, res, next) => {
  try {
    const data = await promptService.toggleFavorite({
      promptId: req.params.promptId,
      businessId: req.business._id,
      userId: req.user.id,
      meta: getMeta(req),
    });
    return sendSuccess(res, 'Prompt favorite toggled.', data);
  } catch (err) {
    next(err);
  }
};

// ─── Reuse Prompt ─────────────────────────────────────────────────────────────
// POST /prompts/:promptId/reuse

const reusePrompt = async (req, res, next) => {
  try {
    const data = await promptService.reusePrompt({
      promptId: req.params.promptId,
      businessId: req.business._id,
      userId: req.user.id,
      business: req.business,
      meta: getMeta(req),
    });
    return sendSuccess(res, 'Prompt reused and posts generated successfully.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPrompts,
  toggleFavorite,
  reusePrompt,
};
