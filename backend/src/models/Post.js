const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const POST_STATUS = require('../constants/postStatus');
const PLATFORMS = require('../constants/platforms');

const postSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required'],
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
    default: '',
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2200, 'Content cannot exceed 2200 characters'],
  },
  platform: {
    type: String,
    enum: Object.values(PLATFORMS),
    default: PLATFORMS.MANUAL,
  },
  status: {
    type: String,
    enum: Object.values(POST_STATUS),
    default: POST_STATUS.DRAFT,
    index: true,
  },
  scheduledAt: {
    type: Date,
    default: null,
    index: true,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  hashtags: {
    type: [String],
    default: [],
  },
  mediaUrls: {
    type: [String],
    default: [],
  },
  media: {
    type: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
      bytes: { type: Number }
    }],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 5;
      },
      message: 'A post can have a maximum of 5 media items'
    }
  },
  generatedImage: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    prompt: { type: String, default: null },
    provider: { type: String, default: null },
    model: { type: String, default: null },
    createdAt: { type: Date, default: null },
  },
});

// Indexes
postSchema.index({ businessId: 1, status: 1 });
postSchema.index({ businessId: 1, scheduledAt: 1 });
postSchema.index({ businessId: 1, createdAt: -1 });

postSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

postSchema.plugin(basePlugin);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
