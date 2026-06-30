const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');
const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const notificationService = require('./notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

const writeAuditLog = async ({ action, userId, businessId, entity, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      businessId,
      entity: entity || 'Media',
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

const uploadToCloudinary = async (file, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(new AppError('Failed to upload image to Cloudinary.', 500));
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn(`Cloudinary destroy returned ${result.result} for ${publicId}`);
    }
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error.message);
  }
};

// ─── Post Media ───────────────────────────────────────────────────────────────

const uploadMedia = async ({ businessId, postId, file, userId, meta = {} }) => {
  if (!file) throw new AppError('No image file provided.', 400);

  const post = await Post.findOne({ _id: postId, businessId });
  if (!post) throw new AppError('Post not found.', 404);

  if (post.media.length >= 5) {
    throw new AppError('A post can have a maximum of 5 media items.', 400);
  }

  const uploadResult = await uploadToCloudinary(file, {
    folder: `localboost-ai/${businessId}/${postId}`,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });

  const mediaItem = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    bytes: uploadResult.bytes
  };

  post.media.push(mediaItem);
  await post.save();

  await writeAuditLog({
    action: 'MEDIA_UPLOADED',
    userId,
    businessId,
    entity: 'PostMedia',
    entityId: post._id,
    meta: { ...meta, publicId: mediaItem.publicId }
  });

  await notificationService.createNotification({
    userId,
    businessId,
    title: 'Media Uploaded',
    message: 'Media uploaded successfully.',
    type: NOTIFICATION_TYPES.SUCCESS,
    entityType: 'Post',
    entityId: post._id,
  });

  return mediaItem;
};

const deleteMedia = async ({ businessId, postId, publicId, userId, meta = {} }) => {
  const post = await Post.findOne({ _id: postId, businessId });
  if (!post) throw new AppError('Post not found.', 404);

  const mediaIndex = post.media.findIndex(m => m.publicId === publicId);
  if (mediaIndex === -1) {
    throw new AppError('Media not found on this post.', 404);
  }

  await deleteFromCloudinary(publicId);

  post.media.splice(mediaIndex, 1);
  await post.save();

  await writeAuditLog({
    action: 'MEDIA_DELETED',
    userId,
    businessId,
    entity: 'PostMedia',
    entityId: post._id,
    meta: { ...meta, publicId }
  });

  return { message: 'Media deleted successfully' };
};

// ─── User Avatar ───────────────────────────────────────────────────────────────

const uploadAvatar = async ({ userId, file, meta = {} }) => {
  if (!file) throw new AppError('No image file provided.', 400);
  
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.avatar && user.avatar.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  const uploadResult = await uploadToCloudinary(file, {
    folder: `localboost-ai/users/${userId}`,
    resource_type: 'image',
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  });

  user.avatar = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
  await user.save();

  await writeAuditLog({
    action: 'USER_AVATAR_UPDATED',
    userId,
    entity: 'User',
    entityId: user._id,
    meta: { ...meta, publicId: user.avatar.publicId }
  });

  return { user: user.toJSON() };
};

const deleteAvatar = async ({ userId, meta = {} }) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.avatar && user.avatar.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  user.avatar = undefined;
  await user.save();

  return { user: user.toJSON() };
};

// ─── Business Logo ────────────────────────────────────────────────────────────

const uploadLogo = async ({ businessId, file, userId, meta = {} }) => {
  if (!file) throw new AppError('No image file provided.', 400);
  
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.logo && business.logo.publicId) {
    await deleteFromCloudinary(business.logo.publicId);
  }

  const uploadResult = await uploadToCloudinary(file, {
    folder: `localboost-ai/businesses/${businessId}`,
    resource_type: 'image',
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });

  business.logo = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
  await business.save();

  await writeAuditLog({
    action: 'BUSINESS_LOGO_UPDATED',
    userId,
    businessId,
    entity: 'Business',
    entityId: business._id,
    meta: { ...meta, publicId: business.logo.publicId }
  });

  return { business: business.toJSON() };
};

const deleteLogo = async ({ businessId, userId, meta = {} }) => {
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.logo && business.logo.publicId) {
    await deleteFromCloudinary(business.logo.publicId);
  }

  business.logo = undefined;
  await business.save();

  return { business: business.toJSON() };
};

// ─── Business Cover Image ─────────────────────────────────────────────────────

const uploadCoverImage = async ({ businessId, file, userId, meta = {} }) => {
  if (!file) throw new AppError('No image file provided.', 400);
  
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.coverImage && business.coverImage.publicId) {
    await deleteFromCloudinary(business.coverImage.publicId);
  }

  const uploadResult = await uploadToCloudinary(file, {
    folder: `localboost-ai/businesses/${businessId}`,
    resource_type: 'image',
    width: 1600,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });

  business.coverImage = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
  await business.save();

  await writeAuditLog({
    action: 'BUSINESS_COVER_UPDATED',
    userId,
    businessId,
    entity: 'Business',
    entityId: business._id,
    meta: { ...meta, publicId: business.coverImage.publicId }
  });

  return { business: business.toJSON() };
};

const deleteCoverImage = async ({ businessId, userId, meta = {} }) => {
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.coverImage && business.coverImage.publicId) {
    await deleteFromCloudinary(business.coverImage.publicId);
  }

  business.coverImage = undefined;
  await business.save();

  return { business: business.toJSON() };
};

module.exports = {
  uploadMedia,
  deleteMedia,
  uploadAvatar,
  deleteAvatar,
  uploadLogo,
  deleteLogo,
  uploadCoverImage,
  deleteCoverImage
};
