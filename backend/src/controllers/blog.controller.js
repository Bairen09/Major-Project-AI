const blogService = require('../services/blog.service');
const { sendSuccess } = require('../utils/apiResponse');

const generateBlog = async (req, res, next) => {
  try {
    const { prompt, relatedPostId } = req.body;
    const blog = await blogService.generateBlog({
      businessId: req.business._id,
      ownerId: req.user.id,
      prompt,
      relatedPostId
    });
    return sendSuccess(res, 'Blog generated successfully', blog, 201);
  } catch (err) {
    next(err);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const result = await blogService.getBlogs(req.business._id, req.query);
    return sendSuccess(res, 'Blogs retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogById(req.business._id, req.params.blogId);
    return sendSuccess(res, 'Blog retrieved successfully', blog);
  } catch (err) {
    next(err);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlog(req.business._id, req.user.id, req.body);
    return sendSuccess(res, 'Blog created successfully', blog, 201);
  } catch (err) {
    next(err);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const blog = await blogService.updateBlog(req.business._id, req.params.blogId, req.body);
    return sendSuccess(res, 'Blog updated successfully', blog);
  } catch (err) {
    next(err);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.business._id, req.params.blogId);
    return sendSuccess(res, 'Blog deleted successfully');
  } catch (err) {
    next(err);
  }
};

const uploadCoverImage = async (req, res, next) => {
  try {
    const blog = await blogService.uploadCoverImage(req.business._id, req.params.blogId, req.file);
    return sendSuccess(res, 'Cover image uploaded successfully', blog);
  } catch (err) {
    next(err);
  }
};

const generateCoverImage = async (req, res, next) => {
  try {
    const blog = await blogService.generateCoverImage(req.business._id, req.params.blogId, req.body.prompt);
    return sendSuccess(res, 'Cover image generated successfully', blog);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateBlog,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadCoverImage,
  generateCoverImage
};
