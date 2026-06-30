const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getMeta = (req) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.requestId,
});

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const data = await authService.register({ name, email, password }, getMeta(req));
    return sendCreated(res, 'Registration successful.', data);
  } catch (err) {
    next(err);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password }, getMeta(req));
    return sendSuccess(res, 'Login successful.', data);
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword({ email });
    return sendSuccess(
      res,
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const data = await authService.resetPassword({ token, password }, getMeta(req));
    return sendSuccess(res, data.message);
  } catch (err) {
    next(err);
  }
};

// ─── Me ──────────────────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user.id);
    return sendSuccess(res, 'User fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
