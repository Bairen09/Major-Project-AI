const express = require('express');
const { sendSuccess } = require('../../utils/apiResponse');

const router = express.Router();

// GET /public/blogs
// Optional query params: isSuperAdminBlog (boolean), excludeBusinessId (string)
router.get('/blogs', async (req, res, next) => {
  try {
    const { isSuperAdminBlog, excludeBusinessId, page, limit } = req.query;
    const query = { status: 'PUBLISHED' };
    
    if (isSuperAdminBlog === 'true') {
      query.isSuperAdminBlog = true;
    } else {
      if (excludeBusinessId) {
        query.businessId = { $ne: excludeBusinessId };
      }
      query.isSuperAdminBlog = { $ne: true };
    }
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const Blog = require('../../models/Blog'); 
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('businessId', 'name logo slug')
      .populate('ownerId', 'name avatarUrl');
      
    const total = await Blog.countDocuments(query);
    
    return sendSuccess(res, 'Public blogs retrieved successfully', {
      blogs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /public/blogs/:id
router.get('/blogs/:id', async (req, res, next) => {
  try {
    const Blog = require('../../models/Blog'); 
    const blog = await Blog.findOne({ _id: req.params.id })
      .populate('businessId', 'name logo slug')
      .populate('ownerId', 'name avatarUrl');
      
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    return sendSuccess(res, 'Blog retrieved successfully', blog);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
