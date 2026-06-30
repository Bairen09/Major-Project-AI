const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../errors/AppError');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    sendSuccess(res, 'Dashboard loaded', data);
  } catch (error) {
    next(error);
  }
};

exports.getPlatformStatus = async (req, res, next) => {
  try {
    const data = await adminService.getPlatformStatus();
    sendSuccess(res, 'Platform status loaded', data);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers(req.query);
    sendSuccess(res, 'Users loaded', data);
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const data = await adminService.getUserDetails(req.params.id);
    sendSuccess(res, 'User details loaded', data);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const data = await adminService.updateUserStatus(req.params.id, req.body.status);
    sendSuccess(res, 'User status updated', data);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getBusinesses = async (req, res, next) => {
  try {
    const data = await adminService.getBusinesses(req.query);
    sendSuccess(res, 'Businesses loaded', data);
  } catch (error) {
    next(error);
  }
};

exports.getBusinessDetails = async (req, res, next) => {
  try {
    const data = await adminService.getBusinessDetails(req.params.id);
    sendSuccess(res, 'Business details loaded', data);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

exports.updateBusinessStatus = async (req, res, next) => {
  try {
    const data = await adminService.updateBusinessStatus(req.params.id, req.body.isActive);
    sendSuccess(res, 'Business status updated', data);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.deleteBusiness = async (req, res, next) => {
  try {
    const data = await adminService.deleteBusiness(req.params.id, req.user.id);
    sendSuccess(res, 'Business deleted', data);
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalytics();
    sendSuccess(res, 'Analytics loaded', data);
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const data = await adminService.getAuditLogs(req.query);
    sendSuccess(res, 'Audit logs loaded', data);
  } catch (error) {
    next(error);
  }
};
