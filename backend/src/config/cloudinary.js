const cloudinary = require('cloudinary').v2;

// The dotenv config is already loaded by server.js, but we can rely on it if this is loaded later.
// However, ensure env variables are read correctly.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
