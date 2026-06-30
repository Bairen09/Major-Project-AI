// src/utils/imagePromptBuilder.js
// Builds an optimized image generation prompt from business + post context.

/**
 * Maps a platform to its ideal image dimensions/aspect ratio hint.
 */
const getPlatformImageSpec = (platform) => {
  switch ((platform || '').toLowerCase()) {
    case 'instagram': return { aspect: '1:1', spec: 'square image, 1080x1080, perfect for Instagram feed' };
    case 'facebook':  return { aspect: '16:9', spec: 'landscape image, 1200x630, optimised for Facebook sharing' };
    case 'google':    return { aspect: '4:3', spec: 'professional image, 1200x900, optimised for Google Business' };
    default:          return { aspect: '16:9', spec: 'landscape marketing image' };
  }
};

/**
 * Builds an optimised AI image-generation prompt.
 *
 * @param {Object} p
 * @param {Object} p.business  - Mongoose business document (plain object)
 * @param {Object} p.post      - Mongoose post document (plain object)
 * @param {string} [p.style]   - Optional style hint, e.g. "modern", "minimalist"
 * @param {string} [p.aspectRatio] - Optional override aspect ratio, e.g. "1:1"
 * @returns {string} Final prompt string ready to send to image provider
 */
const buildImagePrompt = ({ business, post, style = null, aspectRatio = null }) => {
  const businessName = business.name || 'Local Business';
  const category     = business.category || business.industry || 'business';
  const brandVoice   = business.settings?.tone || 'professional and friendly';
  const colors       = (business.settings?.brandColors || []).slice(0, 3).join(', ') || 'neutral palette';
  const topic        = post.topic || post.title || '';
  const caption      = post.content ? post.content.substring(0, 200) : '';

  const { spec: platformSpec, aspect: defaultAspect } = getPlatformImageSpec(post.platform);
  const finalAspect = aspectRatio || defaultAspect;
  const styleHint   = style ? `, ${style} style` : '';

  const parts = [
    `A high-quality marketing photograph for "${businessName}", a ${category}.`,
    topic ? `Theme: ${topic}.` : '',
    caption ? `Context: "${caption}".` : '',
    `Visual style: ${brandVoice}${styleHint}.`,
    colors !== 'neutral palette' ? `Brand colours to incorporate: ${colors}.` : '',
    `Composition: ${platformSpec}.`,
    `Aspect ratio: ${finalAspect}.`,
    'No text overlays, no watermarks, no logos in the image.',
    'Photorealistic, vibrant, well-lit, commercial-grade quality.',
  ].filter(Boolean);

  return parts.join(' ');
};

module.exports = { buildImagePrompt };
