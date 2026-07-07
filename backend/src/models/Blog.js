const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');

const blogSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: function() { return !this.isSuperAdminBlog; },
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String, // Stored as HTML/Rich text
    required: [true, 'Blog content is required'],
  },
  seoKeywords: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT',
    index: true,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  isSuperAdminBlog: {
    type: Boolean,
    default: false,
    index: true,
  },
  coverImage: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  relatedPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  }
});

// Indexes for faster querying
blogSchema.index({ businessId: 1, status: 1 });
blogSchema.index({ businessId: 1, createdAt: -1 });

blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

blogSchema.plugin(basePlugin);

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
