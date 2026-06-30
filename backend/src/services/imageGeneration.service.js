// src/services/imageGeneration.service.js
//
// Isolated AI image-generation service.
// Provider is resolved from IMAGE_PROVIDER env var:
//   openai   → OpenAI Images API  (DALL-E 3 etc.)
//   gemini   → Google Gemini Imagen
//   flux     → Black Forest Labs / Together AI Flux
//
// All providers are routed through this single file so the rest of the
// application never needs to change when swapping providers.

const cloudinary = require('../config/cloudinary');
const AppError   = require('../errors/AppError');

// ─── Cloudinary Upload Helper ────────────────────────────────────────────────

/**
 * Uploads a raw Buffer to Cloudinary and returns { url, publicId }.
 */
const uploadBufferToCloudinary = (buffer, folder = 'localboost/generated') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(new AppError('Failed to upload generated image to Cloudinary.', 500));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// ─── Provider Implementations ────────────────────────────────────────────────

/**
 * OpenAI DALL-E  (IMAGE_PROVIDER=openai)
 * Env: IMAGE_API_URL (default DALL-E 3 endpoint), IMAGE_API_KEY, IMAGE_MODEL
 */
const generateWithOpenAI = async (prompt, options = {}) => {
  const apiKey  = process.env.OPENAI_API_KEY || process.env.IMAGE_API_KEY;
  const apiUrl  = process.env.IMAGE_API_URL || 'https://api.openai.com/v1/images/generations';
  const model   = process.env.OPENAI_IMAGE_MODEL || process.env.IMAGE_MODEL || 'dall-e-3';
  const size    = options.size || '1792x1024';

  if (!apiKey) throw new AppError('IMAGE_API_KEY is not configured.', 500);

  const response = await fetch(apiUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, n: 1, size }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`OpenAI image generation failed: ${response.status} ${body}`, 502);
  }

  const json = await response.json();
  const data = json?.data?.[0];

  if (!data) throw new AppError('OpenAI returned no image data.', 502);

  if (data.b64_json) {
    return { buffer: Buffer.from(data.b64_json, 'base64'), model };
  } else if (data.url) {
    const imgRes = await fetch(data.url);
    if (!imgRes.ok) throw new AppError('Failed to download generated image.', 502);
    const arrayBuffer = await imgRes.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), model };
  } else {
    throw new AppError('OpenAI returned no image URL or base64 data.', 502);
  }
};

/**
 * Google Gemini Imagen  (IMAGE_PROVIDER=gemini)
 * Env: IMAGE_API_KEY, IMAGE_MODEL (default: imagegeneration@006)
 */
const generateWithGemini = async (prompt, _options = {}) => {
  const apiKey = process.env.IMAGE_API_KEY;
  const model  = process.env.IMAGE_MODEL || 'imagen-3.0-generate-002';
  if (!apiKey) throw new AppError('IMAGE_API_KEY is not configured.', 500);

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`Gemini image generation failed: ${response.status} ${body}`, 502);
  }

  const json        = await response.json();
  const b64         = json?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new AppError('Gemini returned no image data.', 502);

  return { buffer: Buffer.from(b64, 'base64'), model };
};

/**
 * Flux / Together AI  (IMAGE_PROVIDER=flux)
 * Env: IMAGE_API_URL (required), IMAGE_API_KEY, IMAGE_MODEL
 */
const generateWithFlux = async (prompt, options = {}) => {
  const apiKey = process.env.IMAGE_API_KEY;
  const apiUrl = process.env.IMAGE_API_URL || 'https://api.together.xyz/v1/images/generations';
  const model  = process.env.IMAGE_MODEL   || 'black-forest-labs/FLUX.1-dev';
  if (!apiKey) throw new AppError('IMAGE_API_KEY is not configured.', 500);

  const response = await fetch(apiUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, n: 1, width: 1344, height: 768 }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`Flux image generation failed: ${response.status} ${body}`, 502);
  }

  const json     = await response.json();
  const imageUrl = json?.data?.[0]?.url;
  if (!imageUrl) throw new AppError('Flux returned no image URL.', 502);

  const imgRes      = await fetch(imageUrl);
  if (!imgRes.ok) throw new AppError('Failed to download generated image.', 502);
  const arrayBuffer = await imgRes.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), model };
};

// ─── Provider Router ─────────────────────────────────────────────────────────

const PROVIDERS = { openai: generateWithOpenAI, gemini: generateWithGemini, flux: generateWithFlux };

/**
 * Main entry point.
 * Generates an image, uploads it to Cloudinary, and returns metadata.
 *
 * @param {string} prompt     - The image generation prompt.
 * @param {Object} [options]  - { style, aspectRatio, size }
 * @returns {{ url, publicId, provider, model }}
 */
const generateAndUpload = async (prompt, options = {}) => {
  const providerKey = (process.env.IMAGE_PROVIDER || 'openai').toLowerCase();
  const generator   = PROVIDERS[providerKey];

  if (!generator) {
    throw new AppError(
      `Unsupported IMAGE_PROVIDER "${providerKey}". Valid options: openai, gemini, flux.`,
      500
    );
  }

  const { buffer, model } = await generator(prompt, options);
  const { url, publicId } = await uploadBufferToCloudinary(buffer);

  return { url, publicId, provider: providerKey, model };
};

module.exports = { generateAndUpload };
