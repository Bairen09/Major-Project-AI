// src/controllers/adminStaff.controller.js

const adminStaffService = require('../services/adminStaff.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

exports.createStaff = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const staff = await adminStaffService.createStaff(req.body, req.user.id, meta);
    sendCreated(res, 'Staff account created successfully', { staff });
  } catch (err) {
    next(err);
  }
};

exports.listStaff = async (req, res, next) => {
  try {
    const data = await adminStaffService.listStaff(req.query);
    sendSuccess(res, 'Staff list retrieved', data);
  } catch (err) {
    next(err);
  }
};

exports.updateStaffStatus = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return next(new (require('../errors/AppError'))('isActive must be a boolean.', 400));
    }
    const staff = await adminStaffService.updateStaffStatus(req.params.id, isActive, req.user.id, meta);
    sendSuccess(res, `Staff account ${isActive ? 'activated' : 'suspended'}`, { staff });
  } catch (err) {
    next(err);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const result = await adminStaffService.deleteStaff(req.params.id, req.user.id, meta);
    sendSuccess(res, 'Staff account deleted', result);
  } catch (err) {
    next(err);
  }
};
