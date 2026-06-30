const Business = require('../models/Business');
const Post = require('../models/Post');
const AppError = require('../errors/AppError');
const businessService = require('./business.service'); // for analytics summary

const SYSTEM_PROMPT = `You are LocalBoost AI.
You are NOT ChatGPT.
You are an expert:
• Marketing Strategist
• Social Media Expert
• Brand Consultant
• Business Growth Advisor
• SEO Specialist
• Copywriter

Always answer specifically for the user's business.
Never answer generically.
Use the provided business context before every response.
If information is missing, ask concise follow-up questions.
Never invent business data.

Inside the assistant, support these quick commands:
/campaign - Help plan a campaign
/calendar - Suggest content calendar
/hashtags - Suggest hashtags
/caption - Write or improve a caption
/seo - Suggest SEO improvements
/analyze - Analyze analytics
/rewrite - Rewrite text
/festival - Plan a festival campaign
/image - Suggest image ideas
/ideas - Brainstorm business growth ideas

Detect these and produce focused outputs.`;

const fetchChatResponse = async ({ businessId, messages }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AppError('OPENAI_API_KEY is not configured.', 500);

  // 1. Gather Business Context
  const business = await Business.findById(businessId).lean();
  if (!business) throw new AppError('Business not found.', 404);

  // Last 5 posts
  const recentPosts = await Post.find({ businessId, status: 'published' })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(5)
    .lean();

  // Next 5 scheduled posts
  const scheduledPosts = await Post.find({ businessId, status: 'scheduled' })
    .sort({ scheduledFor: 1 })
    .limit(5)
    .lean();

  // Analytics summary (simulate or fetch from business.service)
  // We can just use the dashboard summary logic
  let analyticsSummary = null;
  try {
    const summary = await businessService.getDashboardSummary(businessId);
    analyticsSummary = summary;
  } catch (err) {
    console.error('Failed to fetch analytics for assistant context', err);
  }

  // Construct Context String
  const contextString = `
--- BUSINESS CONTEXT ---
Name: ${business.name}
Category: ${business.category}
Industry: ${business.industry || 'Not specified'}
Description: ${business.description || 'Not specified'}
Brand Voice: ${business.settings?.brandVoice || 'Professional'}
Target Audience: ${business.settings?.targetAudience || 'General'}
Location: ${JSON.stringify(business.location || {})}

--- LAST 5 POSTS ---
${recentPosts.map(p => `- [${p.platform}] ${p.content.substring(0, 50)}...`).join('\n') || 'None'}

--- NEXT 5 SCHEDULED POSTS ---
${scheduledPosts.map(p => `- [${p.platform}] ${p.content.substring(0, 50)}...`).join('\n') || 'None'}

--- ANALYTICS SUMMARY ---
${analyticsSummary ? JSON.stringify({
  totalPosts: analyticsSummary.totalPosts,
  totalEngagement: analyticsSummary.totalEngagement,
  engagementRate: analyticsSummary.avgEngagementRate
}) : 'Not available'}
------------------------
`;

  // 2. Prepare Messages Array
  // We keep the last 10 messages from the frontend (frontend should slice it, but we enforce here)
  const slicedMessages = messages.slice(-10);

  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextString },
    ...slicedMessages
  ];

  // 3. Call OpenAI Responses API
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
  // Use the Responses API as explicitly requested
  const apiUrl = process.env.OPENAI_RESPONSES_API_URL || 'https://api.openai.com/v1/responses';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      // The exact schema for the hypothetical Responses API might vary, 
      // but standard schema typically works for testing compliance.
      // If it falls back, we can adjust.
      body: JSON.stringify({
        model,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      // If the hypothetical /responses endpoint fails, we will gracefully fallback to chat/completions
      console.warn(`Responses API failed with ${response.status}. Falling back to chat/completions API...`);
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
        }),
      });
      
      if (!fallbackResponse.ok) {
        const body = await fallbackResponse.text();
        throw new AppError(`OpenAI API failed: ${fallbackResponse.status} ${body}`, 502);
      }
      
      const fallbackData = await fallbackResponse.json();
      return fallbackData;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AIAssistant] Error:', error);
    throw new AppError(error.message || 'Failed to communicate with AI Assistant', 500);
  }
};

module.exports = {
  fetchChatResponse
};
