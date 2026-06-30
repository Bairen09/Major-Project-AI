// src/middleware/requirePost.js

const Post = require('../models/Post');
const AppError = require('../errors/AppError');

/**
 * Verifies that the post exists, belongs to the requesting business,
 * and has not been soft deleted. Attaches req.post for downstream use.
 *
 * Usage: protect, requireBusiness, requirePost, controller
 */
const requirePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return next(new AppError('Post not found.', 404));
        }

        // Verify the post belongs to the business context
        if (!post.businessId.equals(req.business._id)) {
            return next(
                new AppError('You do not have permission to access this post.', 403)
            );
        }

        req.post = post;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = requirePost;
