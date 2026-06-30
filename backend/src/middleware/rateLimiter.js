const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many requests. Please try again later.');
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many authentication attempts. Please try again in 15 minutes.');
  },
});

module.exports = { globalLimiter, authLimiter };
