// src/controllers/post.controller.js

const postService = require('../services/post.service');
const subscriptionService = require('../services/subscription.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');

const getMeta = (req) => ({
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
});

// ─── Generate Posts ───────────────────────────────────────────────────────────

const generatePosts = async (req, res, next) => {
    try {
        await subscriptionService.consumePostQuota(req.user.id);
        const data = await postService.generatePosts({
            business: req.business,
            params: req.body,
            userId: req.user.id,
            historyId: req.body.historyId || null,
        });
        return sendSuccess(res, 'Posts generated successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Save Post ────────────────────────────────────────────────────────────────

const savePost = async (req, res, next) => {
    try {
        await subscriptionService.consumePostQuota(req.user.id);
        const data = await postService.savePost({
            business: req.business,
            userId: req.user.id,
            data: req.body,
            meta: getMeta(req),
        });
        return sendCreated(res, 'Post saved successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── List Posts ───────────────────────────────────────────────────────────────

const listPosts = async (req, res, next) => {
    try {
        const data = await postService.listPosts({
            business: req.business,
            query: req.query,
        });
        return sendSuccess(res, 'Posts fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Get Post ─────────────────────────────────────────────────────────────────

const getPost = async (req, res, next) => {
    try {
        const data = await postService.getPost(req.post);
        return sendSuccess(res, 'Post fetched successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Update Post ──────────────────────────────────────────────────────────────

const updatePost = async (req, res, next) => {
    try {
        const data = await postService.updatePost({
            post: req.post,
            data: req.body,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendSuccess(res, 'Post updated successfully.', data);
    } catch (err) {
        next(err);
    }
};

// ─── Delete Post ──────────────────────────────────────────────────────────────

const deletePost = async (req, res, next) => {
    try {
        await postService.deletePost({
            post: req.post,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendNoContent(res);
    } catch (err) {
        next(err);
    }
};

// ─── Duplicate Post ───────────────────────────────────────────────────────────

const duplicatePost = async (req, res, next) => {
    try {
        const data = await postService.duplicatePost({
            post: req.post,
            userId: req.user.id,
            meta: getMeta(req),
        });
        return sendCreated(res, 'Post duplicated successfully.', data);
    } catch (err) {
        next(err);
    }
};


// ─── Generate Image ───────────────────────────────────────────────────────────

const generateImage = async (req, res, next) => {
    try {
        const post = await postService.generateImage({
            businessId: req.business._id,
            postId:     req.params.postId,
            userId:     req.user.id,
            options:    req.body || {},   // style, aspectRatio, etc.
            meta:       getMeta(req),
        });
        return sendSuccess(res, 'Image generated successfully.', { post });
    } catch (err) {
        next(err);
    }
};

// ─── Regenerate Image ─────────────────────────────────────────────────────────

const regenerateImage = async (req, res, next) => {
    try {
        const post = await postService.regenerateImage({
            businessId: req.business._id,
            postId:     req.params.postId,
            userId:     req.user.id,
            options:    req.body || {},
            meta:       getMeta(req),
        });
        return sendSuccess(res, 'Image regenerated successfully.', { post });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    generatePosts,
    savePost,
    listPosts,
    getPost,
    updatePost,
    deletePost,
    duplicatePost,
    generateImage,
    regenerateImage,
};