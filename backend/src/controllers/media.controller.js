const mediaService = require('../services/media.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getMeta = (req) => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.requestId,
});

// ─── Upload Media ───────────────────────────────────────────────────────────

const uploadMedia = async (req, res, next) => {
  try {
    const { id, postId } = req.params;
    
    const mediaItem = await mediaService.uploadMedia({
      businessId: id,
      postId,
      file: req.file,
      userId: req.user.id,
      meta: getMeta(req),
    });

    return sendCreated(res, 'Media uploaded successfully.', mediaItem);
  } catch (err) {
    next(err);
  }
};

// ─── Delete Media ───────────────────────────────────────────────────────────

const deleteMedia = async (req, res, next) => {
  try {
    const { id, postId, publicId } = req.params;

    // Decode publicId because it usually contains slashes (e.g. folder/file)
    const decodedPublicId = decodeURIComponent(publicId);

    const data = await mediaService.deleteMedia({
      businessId: id,
      postId,
      publicId: decodedPublicId,
      userId: req.user.id,
      meta: getMeta(req),
    });

    return sendSuccess(res, data.message);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadMedia,
  deleteMedia
};
