// src/services/post.service.js

const Post = require('../models/Post');
const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');
const PromptHistory = require('../models/PromptHistory');
const AppError = require('../errors/AppError');
const POST_STATUS = require('../constants/postStatus');
const { complete } = require('../utils/groq');
const { buildPostPrompt } = require('../utils/promptBuilder');
const { buildImagePrompt } = require('../utils/imagePromptBuilder');
const imageGenerationService = require('./imageGeneration.service');
const cloudinary = require('../config/cloudinary');
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

// ─── Parse Groq JSON Response ─────────────────────────────────────────────────

/**
 * Parses Groq JSON response into structured post objects.
 * Strips markdown fences if present before parsing.
 *
 * @param {string} rawText
 * @returns {Array}
 */
const parseGroqResponse = (rawText) => {
    // Strip markdown code fences if model adds them despite instructions
    const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
        throw new Error('Groq response is not a JSON array.');
    }

    return parsed
        .filter((item) => item.caption && typeof item.caption === 'string')
        .map((item) => ({
            caption: item.caption.trim(),
            callToAction: (item.callToAction || '').trim(),
            hashtags: Array.isArray(item.hashtags)
                ? item.hashtags
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.startsWith('#') && tag.length > 1)
                : [],
        }));
};

// ─── Generate Posts ───────────────────────────────────────────────────────────

const generatePosts = async ({ business, params, userId, historyId }) => {
    let resolvedParams = params;

    // Feature 5: if historyId is provided, load params from stored prompt
    if (historyId) {
        const stored = await PromptHistory.findOne({
            _id: historyId,
            businessId: business._id,
        });
        if (!stored) {
            throw new AppError('Prompt history entry not found.', 404);
        }
        resolvedParams = {
            platform: stored.platform,
            goal: stored.goal,
            tone: stored.tone,
            audience: stored.audience,
            topic: stored.topic,
            count: stored.count,
        };
    }

    const tone = resolvedParams.tone || business.settings?.tone || 'friendly';
    const audience =
        resolvedParams.audience ||
        business.settings?.targetAudience ||
        'General audience';

    const safeCount = Math.min(Math.max(resolvedParams.count || 5, 1), 10);

    const prompt = buildPostPrompt({
        business,
        platform: resolvedParams.platform,
        goal: resolvedParams.goal,
        tone,
        audience,
        topic: resolvedParams.topic,
        count: safeCount,
    });

    const maxTokens = 400 * safeCount;
    const rawText = await complete(prompt, { maxTokens });

    let parsed;
    try {
        parsed = parseGroqResponse(rawText);
    } catch (err) {
        throw new AppError(
            'AI failed to generate posts in the expected format. Please try again.',
            502
        );
    }

    if (parsed.length === 0) {
        throw new AppError(
            'AI returned no usable posts. Please try again.',
            502
        );
    }

    // Feature 1: Record the generation in prompt history (only for direct generates, not reuse)
    if (userId && business._id && !historyId) {
        try {
            await PromptHistory.create({
                businessId: business._id,
                userId,
                platform: resolvedParams.platform,
                goal: resolvedParams.goal,
                tone,
                audience,
                topic: resolvedParams.topic || '',
                count: safeCount,
            });
        } catch (err) {
            // Non-fatal: generation succeeded even if history fails
            if (process.env.NODE_ENV === 'development') {
                console.error('[PromptHistory] Failed to record prompt:', err.message);
            }
        }
    }

    if (userId && business._id) {
        await notificationService.createNotification({
            userId,
            businessId: business._id,
            title: 'AI Posts Generated',
            message: `Successfully generated ${parsed.length} AI posts.`,
            type: NOTIFICATION_TYPES.SUCCESS,
            entityType: 'Business',
            entityId: business._id,
        });
    }

    return parsed;
};

// ─── Save Post ────────────────────────────────────────────────────────────────

const savePost = async ({ business, userId, data, meta = {} }) => {
    const post = await Post.create({
        businessId: business._id,
        ownerId: userId,
        content: data.content,
        platform: data.platform,
        title: data.title || '',
        hashtags: data.hashtags || [],
        mediaUrls: data.mediaUrls || [],
        aiGenerated: data.aiGenerated || false,
        status: POST_STATUS.DRAFT,
    });

    await writeAuditLog({
        action: 'POST_CREATED',
        userId,
        businessId: business._id,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: business._id,
        title: 'Post Saved',
        message: `Post '${post.title || post.platform}' saved successfully.`,
        type: NOTIFICATION_TYPES.SUCCESS,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
};

// ─── List Posts ───────────────────────────────────────────────────────────────

const listPosts = async ({ business, query }) => {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { businessId: business._id };

    if (query.status) filter.status = query.status;
    if (query.platform) filter.platform = query.platform;

    const [posts, total] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
    ]);

    return {
        posts: posts.map((p) => p.toJSON()),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ─── Get Post ─────────────────────────────────────────────────────────────────

const getPost = async (post) => {
    return post.toJSON();
};

// ─── Update Post ──────────────────────────────────────────────────────────────

const updatePost = async ({ post, data, userId, meta = {} }) => {
    const allowedFields = [
        'content',
        'title',
        'platform',
        'hashtags',
        'mediaUrls',
        'status',
    ];

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            post[field] = data[field];
        }
    });

    await post.save();

    await writeAuditLog({
        action: 'POST_UPDATED',
        userId,
        businessId: post.businessId,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: post.businessId,
        title: 'Post Updated',
        message: `Post '${post.title || post.platform}' updated successfully.`,
        type: NOTIFICATION_TYPES.SUCCESS,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
};

// ─── Delete Post ──────────────────────────────────────────────────────────────

const deletePost = async ({ post, userId, meta = {} }) => {
    await post.softDelete(userId);

    await writeAuditLog({
        action: 'POST_DELETED',
        userId,
        businessId: post.businessId,
        entityId: post._id,
        meta,
    });
};

// ─── Duplicate Post ───────────────────────────────────────────────────────────

const duplicatePost = async ({ post, userId, meta = {} }) => {
    const duplicate = await Post.create({
        businessId: post.businessId,
        ownerId: userId,
        content: `${post.content}\n\n(Copy)`.substring(0, 2200),
        platform: post.platform,
        title: post.title ? `${post.title} (Copy)` : '',
        hashtags: [...post.hashtags],
        mediaUrls: [...post.mediaUrls],
        media: post.media ? [...post.media] : [],
        aiGenerated: post.aiGenerated,
        campaignId: post.campaignId || null,
        status: POST_STATUS.DRAFT,
    });

    await writeAuditLog({
        action: 'POST_DUPLICATED',
        userId,
        businessId: post.businessId,
        entityId: duplicate._id,
        meta,
    });

    return duplicate.toJSON();
};

// ─── Generate Image ───────────────────────────────────────────────────────────

/**
 * Generates an AI marketing image for a post, uploads to Cloudinary,
 * and stores metadata in post.generatedImage.
 * Does NOT touch post.media[].
 */
const generateImage = async ({ businessId, postId, userId, options = {}, meta = {} }) => {
    const [business, post] = await Promise.all([
        Business.findById(businessId),
        Post.findOne({ _id: postId, businessId }),
    ]);

    if (!business) throw new AppError('Business not found.', 404);
    if (!post)     throw new AppError('Post not found.', 404);

    const prompt = buildImagePrompt({
        business: business.toJSON(),
        post:     post.toJSON(),
        style:       options.style || null,
        aspectRatio: options.aspectRatio || null,
    });

    const { url, publicId, provider, model } = await imageGenerationService.generateAndUpload(prompt, options);

    post.generatedImage = { url, publicId, prompt, provider, model, createdAt: new Date() };
    await post.save();

    await writeAuditLog({
        action: 'IMAGE_GENERATED',
        userId,
        businessId: business._id,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: business._id,
        title: 'AI Image Generated',
        message: `AI image generated for post '${post.title || post.platform}'.`,
        type: NOTIFICATION_TYPES.SUCCESS,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
};

// ─── Regenerate Image ─────────────────────────────────────────────────────────

/**
 * Same as generateImage, but first deletes the existing generated image from
 * Cloudinary to avoid orphaned assets.
 */
const regenerateImage = async ({ businessId, postId, userId, options = {}, meta = {} }) => {
    const [business, post] = await Promise.all([
        Business.findById(businessId),
        Post.findOne({ _id: postId, businessId }),
    ]);

    if (!business) throw new AppError('Business not found.', 404);
    if (!post)     throw new AppError('Post not found.', 404);

    // Delete old generated image from Cloudinary first
    if (post.generatedImage?.publicId) {
        try {
            await cloudinary.uploader.destroy(post.generatedImage.publicId);
        } catch (err) {
            console.warn('[ImageGen] Failed to delete old Cloudinary asset:', err.message);
        }
    }

    const prompt = buildImagePrompt({
        business: business.toJSON(),
        post:     post.toJSON(),
        style:       options.style || null,
        aspectRatio: options.aspectRatio || null,
    });

    const { url, publicId, provider, model } = await imageGenerationService.generateAndUpload(prompt, options);

    post.generatedImage = { url, publicId, prompt, provider, model, createdAt: new Date() };
    await post.save();

    await writeAuditLog({
        action: 'IMAGE_REGENERATED',
        userId,
        businessId: business._id,
        entityId: post._id,
        meta,
    });

    await notificationService.createNotification({
        userId,
        businessId: business._id,
        title: 'AI Image Regenerated',
        message: `AI image regenerated for post '${post.title || post.platform}'.`,
        type: NOTIFICATION_TYPES.SUCCESS,
        entityType: 'Post',
        entityId: post._id,
    });

    return post.toJSON();
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