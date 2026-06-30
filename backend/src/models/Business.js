const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const ROLES = require('../constants/roles');
const BUSINESS_CATEGORIES = require('../constants/businessCategories');

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.OWNER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const businessSettingsSchema = new mongoose.Schema(
  {
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'luxury', 'fun', 'casual'],
      default: 'friendly',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    targetAudience: {
      type: String,
      default: '',
      maxlength: [200, 'Target audience cannot exceed 200 characters'],
    },
    autoApprovePosts: {
      type: Boolean,
      default: false,
    },
    postingPreferences: {
      preferredDays: {
        type: [String],
        default: ['monday', 'wednesday', 'friday'],
      },
      preferredTime: {
        type: String,
        default: '10:00',
      },
    },
    brandColors: {
      type: [String],
      default: [],
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { _id: false }
);

const businessSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    minlength: [2, 'Business name must be at least 2 characters'],
    maxlength: [100, 'Business name cannot exceed 100 characters'],
  },
  logoUrl: {
    type: String,
    default: '',
  },
  logo: {
    url: String,
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    enum: BUSINESS_CATEGORIES,
    required: [true, 'Business category is required'],
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  services: {
    type: [String],
    default: [],
  },
  members: {
    type: [memberSchema],
    default: [],
  },
  settings: {
    type: businessSettingsSchema,
    default: () => ({}),
  },
});



// Auto-generate unique slug before saving
businessSchema.pre('save', async function () {
  if (!this.isModified('name') && this.slug) return;

  const base = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Check for uniqueness and append random suffix if needed
  let slug = base;
  let exists = await mongoose.model('Business').findOne({ slug, _id: { $ne: this._id } });

  while (exists) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${base}-${suffix}`;
    exists = await mongoose.model('Business').findOne({ slug, _id: { $ne: this._id } });
  }

  this.slug = slug;
});

businessSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

businessSchema.plugin(basePlugin);

const Business = mongoose.model('Business', businessSchema);
module.exports = Business;
