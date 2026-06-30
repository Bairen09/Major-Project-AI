// src/controllers/user.controller.js

const mediaService = require('../services/media.service');
const { sendSuccess } = require('../utils/apiResponse');

const getMeta = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
});

const uploadAvatar = async (req, res, next) => {
    try {
        const data = await mediaService.uploadAvatar({
            userId: req.user.id,
            file: req.file,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Avatar uploaded successfully.', data);
    } catch (err) {
        next(err);
    }
};

const deleteAvatar = async (req, res, next) => {
    try {
        const data = await mediaService.deleteAvatar({
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Avatar deleted successfully.', data);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadAvatar,
    deleteAvatar,
};
