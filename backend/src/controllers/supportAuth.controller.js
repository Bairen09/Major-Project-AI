// src/controllers/supportAuth.controller.js

const supportAuthService = require('../services/supportAuth.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

exports.login = async (req, res, next) => {
  try {
    const meta = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.requestId,
    };
    const data = await supportAuthService.login(req.body, meta);
    sendSuccess(res, 'Login successful', data);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const staff = await supportAuthService.getMe(req.staff.id);
    sendSuccess(res, 'Staff profile retrieved', { staff });
  } catch (err) {
    next(err);
  }
};
