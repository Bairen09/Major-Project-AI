// src/services/scheduler.service.js

const Post = require('../models/Post');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const POST_STATUS = require('../constants/postStatus');
const notificationService = require('./notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, userId, businessId, entityId, meta = {} }) => {
    try {
        await AuditLog.create({
            action,
            userId,
            businessId,
            entity: 'Post',
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

// ─── Schedule Post ────────────────────────────────────────────────────────────

/**
 * Marks a draft post as scheduled at the given future datetime.
 * Only draft posts may be scheduled.
 *
 * @param {Object} options
 * @param {import('../models/Post').default} options.post   - The post document from req.post
 * @param {string}  options.scheduledAt                     - ISO 8601 datetime string
 * @param {string}  options.userId
 * @param {Object}  options.meta
 * @returns {Object} The updated post as plain JSON
 */
const schedulePost = async ({ post, scheduledAt, userId, meta = {} }) => {
    if (post.status !== POST_STATUS.DRAFT) {
        throw new AppError(
            `Only draft posts can be scheduled. This post is currently "${post.status}".`,
            409
        );
    }

    post.status = POST_STATUS.SCHEDULED;
    post.scheduledAt = new Date(scheduledAt);

    await post.save();

    await writeAuditLog({
        action: 'POST_SCHEDULED',
        userId,
        businessId: post.businessId,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: post.businessId,
        title: 'Post Scheduled',
        message: `Post '${post.title || post.platform}' scheduled for ${new Date(scheduledAt).toLocaleDateString()}.`,
        type: NOTIFICATION_TYPES.INFO,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
};

// ─── Unschedule Post ──────────────────────────────────────────────────────────

/**
 * Returns a scheduled post back to draft, clearing the scheduledAt field.
 * Only scheduled posts may be unscheduled.
 *
 * @param {Object} options
 * @param {import('../models/Post').default} options.post - The post document from req.post
 * @param {string}  options.userId
 * @param {Object}  options.meta
 * @returns {Object} The updated post as plain JSON
 */
const unschedulePost = async ({ post, userId, meta = {} }) => {
    if (post.status !== POST_STATUS.SCHEDULED) {
        throw new AppError(
            `Only scheduled posts can be unscheduled. This post is currently "${post.status}".`,
            409
        );
    }

    post.status = POST_STATUS.DRAFT;
    post.scheduledAt = null;

    await post.save();

    await writeAuditLog({
        action: 'POST_UNSCHEDULED',
        userId,
        businessId: post.businessId,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: post.businessId,
        title: 'Post Unscheduled',
        message: `Post '${post.title || post.platform}' was unscheduled.`,
        type: NOTIFICATION_TYPES.INFO,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
};

// ─── Get Calendar ─────────────────────────────────────────────────────────────

/**
 * Returns all scheduled posts for a business, sorted by scheduledAt ascending.
 * Only includes fields relevant to a calendar view.
 *
 * @param {Object} business - The business document from req.business
 * @returns {Array}
 */
const getCalendar = async (business) => {
    const posts = await Post.find({
        businessId: business._id,
        status: POST_STATUS.SCHEDULED,
    })
        .select('_id title platform status scheduledAt')
        .sort({ scheduledAt: 1 })
        .lean();

    return posts.map((p) => ({
        id: p._id,
        title: p.title || '',
        platform: p.platform,
        status: p.status,
        scheduledAt: p.scheduledAt,
    }));
};

module.exports = {
    schedulePost,
    unschedulePost,
    getCalendar,
};
