// src/services/prompt.service.js

const PromptHistory = require('../models/PromptHistory');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const { complete } = require('../utils/groq');
const { buildPostPrompt } = require('../utils/promptBuilder');
const notificationService = require('./notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');


// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, userId, businessId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      businessId,
      entity: 'PromptHistory',
      entityId,
      ipAddress: meta.ip || '',
      userAgent: meta.userAgent || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AuditLog] Failed to write "${action}" log:`, err.message);
    }
  }
};

// ─── List Prompt History ──────────────────────────────────────────────────────
// Returns latest 20 prompts for a business, newest first.

const listPrompts = async (businessId) => {
  const prompts = await PromptHistory.find({ businessId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return prompts;
};


// ─── Toggle Favorite ──────────────────────────────────────────────────────────

const toggleFavorite = async ({ promptId, businessId, userId, meta = {} }) => {
  const prompt = await PromptHistory.findOne({ _id: promptId, businessId });
  if (!prompt) {
    throw new AppError('Prompt not found.', 404);
  }

  prompt.favorite = !prompt.favorite;
  await prompt.save();

  await writeAuditLog({
    action: 'PROMPT_FAVORITED',
    userId,
    businessId,
    entityId: prompt._id,
    meta,
  });

  await notificationService.createNotification({
    userId,
    businessId,
    title: 'Prompt Favorited',
    message: `Prompt favorited status updated to ${prompt.favorite}.`,
    type: NOTIFICATION_TYPES.INFO,
    entityType: 'PromptHistory',
    entityId: prompt._id,
  });

  return prompt.toJSON();
};

// ─── Reuse Prompt ─────────────────────────────────────────────────────────────
// Loads a stored prompt and generates fresh AI posts using its parameters.

const reusePrompt = async ({ promptId, businessId, userId, business, meta = {} }) => {
  const prompt = await PromptHistory.findOne({ _id: promptId, businessId });
  if (!prompt) {
    throw new AppError('Prompt not found.', 404);
  }

  // Generate fresh posts using stored parameters directly (avoids circular import)
  const safeCount = Math.min(Math.max(prompt.count || 3, 1), 10);
  const builtPrompt = buildPostPrompt({
    business,
    platform: prompt.platform,
    goal: prompt.goal,
    tone: prompt.tone,
    audience: prompt.audience,
    topic: prompt.topic,
    count: safeCount,
  });

  const rawText = await complete(builtPrompt, { maxTokens: 400 * safeCount });

  // Strip markdown fences if present
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let posts;
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    posts = parsed
      .filter((item) => item.caption && typeof item.caption === 'string')
      .map((item) => ({
        caption: item.caption.trim(),
        callToAction: (item.callToAction || '').trim(),
        hashtags: Array.isArray(item.hashtags)
          ? item.hashtags.map((t) => t.trim()).filter((t) => t.startsWith('#') && t.length > 1)
          : [],
      }));
  } catch (err) {
    throw new AppError('AI failed to generate posts in the expected format. Please try again.', 502);
  }

  if (!posts || posts.length === 0) {
    throw new AppError('AI returned no usable posts. Please try again.', 502);
  }

  await writeAuditLog({
    action: 'PROMPT_REUSED',
    userId,
    businessId,
    entityId: prompt._id,
    meta,
  });

  prompt.reuseCount = (prompt.reuseCount || 0) + 1;
  await prompt.save();

  return { prompt: prompt.toJSON(), posts };
};


module.exports = {
  listPrompts,
  toggleFavorite,
  reusePrompt,
};
