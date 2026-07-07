const express = require('express');
const blogController = require('../../controllers/blog.controller');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');

const router = express.Router({ mergeParams: true }); // Allows access to businessId from parent router

// GET /businesses/:businessId/blogs
router.get('/', blogController.getBlogs);

// GET /businesses/:businessId/blogs/:blogId
router.get('/:blogId', blogController.getBlogById);

// POST /businesses/:businessId/blogs
router.post('/', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), blogController.createBlog);

// POST /businesses/:businessId/blogs/generate
router.post('/generate', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), blogController.generateBlog);

// PATCH /businesses/:businessId/blogs/:blogId
router.patch('/:blogId', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), blogController.updateBlog);

// DELETE /businesses/:businessId/blogs/:blogId
router.delete('/:blogId', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), blogController.deleteBlog);

// POST /businesses/:businessId/blogs/:blogId/cover
const upload = require('../../middleware/upload');
router.post('/:blogId/cover', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), upload.single('image'), blogController.uploadCoverImage);

// POST /businesses/:businessId/blogs/:blogId/cover/generate
router.post('/:blogId/cover/generate', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR), blogController.generateCoverImage);

module.exports = router;
