// src/controllers/scheduler.controller.js

const schedulerService = require('../services/scheduler.service');
const { sendSuccess } = require('../utils/apiResponse');

const getMeta = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
});

// ─── Schedule Post ────────────────────────────────────────────────────────────

const schedulePost = async (req, res, next) => {
    try {
        const data = await schedulerService.schedulePost({
            post: req.post,
            scheduledAt: req.body.scheduledAt,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Post scheduled successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Unschedule Post ──────────────────────────────────────────────────────────

const unschedulePost = async (req, res, next) => {
    try {
        const data = await schedulerService.unschedulePost({
            post: req.post,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Post unscheduled successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Get Calendar ─────────────────────────────────────────────────────────────

const getCalendar = async (req, res, next) => {
    try {
        const data = await schedulerService.getCalendar(req.business);
        return sendSuccess(res, 'Calendar fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    schedulePost,
    unschedulePost,
    getCalendar,
};
