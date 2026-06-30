// src/controllers/business.controller.js

const businessService = require('../services/business.service');
const mediaService = require('../services/media.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');

const getMeta = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
});

// ─── Create Business ──────────────────────────────────────────────────────────

const createBusiness = async (req, res, next) => {
    try {
        const data = await businessService.createBusiness({
            userId: req.user.id,
            data: req.body,
            meta: getMeta(req),
        });
        return sendCreated(res, 'Business created successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Get My Businesses ────────────────────────────────────────────────────────

const getMyBusinesses = async (req, res, next) => {
    try {
        const data = await businessService.getMyBusinesses(req.user.id);
        return sendSuccess(res, 'Businesses fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Get Single Business ──────────────────────────────────────────────────────

const getBusiness = async (req, res, next) => {
    try {
        const data = await businessService.getBusiness(req.business);
        return sendSuccess(res, 'Business fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Update Business ──────────────────────────────────────────────────────────

const updateBusiness = async (req, res, next) => {
    try {
        const data = await businessService.updateBusiness({
            business: req.business,
            data: req.body,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Business updated successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Delete Business ──────────────────────────────────────────────────────────

const deleteBusiness = async (req, res, next) => {
    try {
        await businessService.deleteBusiness({
            business: req.business,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendNoContent(res);
    } catch (err) {
        next(err);
    }
};

// ─── Dashboard Summary ────────────────────────────────────────────────────────

const getDashboardSummary = async (req, res, next) => {
    try {
        const data = await businessService.getDashboardSummary(req.business);
        return sendSuccess(res, 'Dashboard summary fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Get Settings ─────────────────────────────────────────────────────────────

const getSettings = async (req, res, next) => {
  try {
    const settings = await businessService.getSettings(req.business);
    return sendSuccess(res, 'Business settings retrieved successfully.', settings);
  } catch (err) {
    next(err);
  }
};

// ─── Update Settings ──────────────────────────────────────────────────────────

const updateSettings = async (req, res, next) => {
    try {
        const data = await businessService.updateSettings({
            business: req.business,
            data: req.body,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Settings updated successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const getAnalytics = async (req, res, next) => {
    try {
        const analytics = await businessService.getAnalytics(req.business);
        return sendSuccess(res, 'Analytics retrieved successfully.', analytics);
    } catch (err) {
        next(err);
    }
};

// ─── Get Members ──────────────────────────────────────────────────────────────

const getMembers = async (req, res, next) => {
    try {
        const data = await businessService.getMembers(req.business);
        return sendSuccess(res, 'Members fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Business Media ─────────────────────────────────────────────────────────────

const uploadLogo = async (req, res, next) => {
    try {
        const data = await mediaService.uploadLogo({
            businessId: req.business._id,
            file: req.file,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Logo uploaded successfully.', data);
    } catch (err) {
        next(err);
    }
};

const deleteLogo = async (req, res, next) => {
    try {
        const data = await mediaService.deleteLogo({
            businessId: req.business._id,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Logo deleted successfully.', data);
    } catch (err) {
        next(err);
    }
};

const uploadCoverImage = async (req, res, next) => {
    try {
        const data = await mediaService.uploadCoverImage({
            businessId: req.business._id,
            file: req.file,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Cover image uploaded successfully.', data);
    } catch (err) {
        next(err);
    }
};

const deleteCoverImage = async (req, res, next) => {
    try {
        const data = await mediaService.deleteCoverImage({
            businessId: req.business._id,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Cover image deleted successfully.', data);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createBusiness,
    getMyBusinesses,
    getBusiness,
    updateBusiness,
    deleteBusiness,
    getDashboardSummary,
    getSettings,
    updateSettings,
    getMembers,
    getAnalytics,
    uploadLogo,
    deleteLogo,
    uploadCoverImage,
    deleteCoverImage,
};