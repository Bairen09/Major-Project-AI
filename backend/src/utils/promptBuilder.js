// src/utils/promptBuilder.js
// Prompt version: 1

const PLATFORMS = require('../constants/platforms');

/**
 * Returns a platform-specific guidance string.
 */
const getPlatformGuidance = (platform) => {
    switch (platform) {
        case PLATFORMS.INSTAGRAM:
            return 'Instagram caption (maximum 2200 characters). Emojis are encouraged.';
        case PLATFORMS.FACEBOOK:
            return 'Facebook post (maximum 500 characters for best engagement). Conversational tone works best.';
        case PLATFORMS.GOOGLE:
            return 'Google Business post (maximum 1500 characters). Professional and informative tone.';
        default:
            return 'Social media post. Keep it concise and engaging.';
    }
};

/**
 * Returns a goal description string for the prompt.
 */
const getGoalDescription = (goal) => {
    switch (goal) {
        case 'awareness':
            return 'Increase brand awareness and reach new customers';
        case 'leads':
            return 'Generate leads and encourage potential customers to get in touch';
        case 'sales':
            return 'Drive sales and increase revenue';
        case 'engagement':
            return 'Boost engagement and build community with existing customers';
        default:
            return 'Promote the business effectively';
    }
};

/**
 * Builds a structured prompt for AI post generation.
 * Instructs Groq to return valid JSON only — no regex parsing needed.
 *
 * @param {Object} params
 * @param {Object} params.business
 * @param {string} params.platform
 * @param {string} params.goal
 * @param {string} params.tone
 * @param {string} params.audience
 * @param {string} [params.topic]
 * @param {number} [params.count]
 * @returns {string}
 */
const buildPostPrompt = ({
    business,
    platform,
    goal,
    tone,
    audience,
    topic,
    count,
}) => {
    const safeCount = Math.min(Math.max(count || 5, 1), 10);
    const platformGuidance = getPlatformGuidance(platform);
    const goalDescription = getGoalDescription(goal);

    const locationParts = [
        business.location?.city,
        business.location?.state,
        business.location?.country,
    ].filter(Boolean);

    const location =
        locationParts.length > 0 ? locationParts.join(', ') : 'Local area';

    const services =
        business.services && business.services.length > 0
            ? business.services.join(', ')
            : 'General services';

    const topicLine = topic ? `\nFocus Topic     : ${topic}` : '';

    const prompt = `You are an expert local business marketing copywriter specializing in social media content.

Business Name   : ${business.name}
Business Type   : ${business.category}
Location        : ${location}
Services        : ${services}
Target Audience : ${audience}
Tone            : ${tone}
Goal            : ${goalDescription}
Platform        : ${platformGuidance}${topicLine}

Generate ${safeCount} unique and creative marketing posts for this business.

Rules:
- Every post must be different. Do not repeat ideas.
- Write naturally for the platform specified.
- Match the tone exactly: ${tone}.
- The call to action must be direct and specific (e.g. "Book your appointment today" not just "Contact us").
- Do not repeat the same call to action across multiple posts. Every post must have a unique call to action.
- Include exactly 5 relevant hashtags per post.
- Do not invent hashtags unrelated to the business.
- Avoid repeating the same hashtag across every post.

Return ONLY a valid JSON array. No explanation, no markdown, no extra text before or after.

Format:
[
  {
    "caption": "full post caption here",
    "callToAction": "specific call to action here",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
  }
]`;

    return prompt;
};

module.exports = { buildPostPrompt };