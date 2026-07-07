const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Post = require('../models/Post');
const AppError = require('../errors/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('./media.service');
const imageGenerationService = require('./imageGeneration.service');

/**
 * Generate a blog using OpenAI API
 */
const generateBlog = async ({ businessId, ownerId, prompt, relatedPostId }) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.IMAGE_API_KEY;
  if (!apiKey) throw new AppError('OpenAI API key is missing. Please configure OPENAI_API_KEY.', 500);

  const Business = require('../models/Business');
  let businessContext = '';
  if (businessId === 'localboost') {
    businessContext = 'You are writing on behalf of "LocalBoost", the platform itself. Make sure the tone is professional, authoritative, and helpful for local businesses using our marketing platform.';
  } else if (businessId) {
    const business = await Business.findById(businessId);
    if (business) {
      businessContext = `You are writing on behalf of "${business.name}"${business.description ? ` - ${business.description}` : ''}. Make sure the tone and subject fit this business perfectly.`;
    }
  }

  let systemPrompt = `You are an expert SEO copywriter and marketer for local businesses.
${businessContext}
Your task is to write a highly engaging, beautifully structured, and SEO-optimized blog post (600-1000 words).
The output MUST be formatted in raw HTML (without <html>, <head>, or <body> tags, just the content).
Do not include markdown wrappers (like \`\`\`html) in the final output.

CRITICAL HTML STRUCTURE REQUIREMENTS:
1. Wrap logical parts of your blog (like Introduction, Main Points, Conclusion) in <section class="blog-section"> tags to create beautiful card-like separations.
2. Use <h2> and <h3> for headings. Make them catchy.
3. Use <blockquote> for important quotes, customer testimonials, or key takeaways.
4. Add 1-2 contextual images in the body using this format: <img src="https://image.pollinations.ai/prompt/{IMAGE_DESCRIPTION}?width=800&height=400&nologo=true" alt="{IMAGE_DESCRIPTION}" />. Replace {IMAGE_DESCRIPTION} with a very detailed, URL-encoded prompt for an AI image generator (e.g. "a_beautiful_latte_art_coffee_in_a_sunny_cafe").
5. Use <ul> or <ol> with <li> for lists.
6. Use <span class="blog-highlight">text</span> for highlighting extremely important words or phrases.
7. Separate sections with <hr /> if a thematic break is needed.

Make the article read like a premium magazine feature.`;

  let userMessage = `Please write a blog post based on this summary/prompt: "${prompt}"\n`;

  // If there's a related post, fetch its content to add context
  if (relatedPostId) {
    const post = await Post.findById(relatedPostId);
    if (post && post.businessId.toString() === businessId.toString()) {
      userMessage += `\nThis blog should expand on our recent social media post: "${post.content}"\n`;
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AppError(`OpenAI API Error: ${errorBody}`, 502);
  }

  const data = await response.json();
  let htmlContent = data.choices[0]?.message?.content || '';

  // Clean up any potential markdown wrapper from OpenAI
  if (htmlContent.startsWith('```html')) {
    htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '');
  } else if (htmlContent.startsWith('```')) {
    htmlContent = htmlContent.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  // Extract a title (first h1 or fallback to prompt snippet)
  let title = 'Generated Blog Post';
  const h1Match = htmlContent.match(/<h1>(.*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1];
  } else {
    title = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
  }

  // Create draft
  const blog = await Blog.create({
    businessId: businessId === 'localboost' ? undefined : businessId,
    ownerId,
    title,
    content: htmlContent,
    aiGenerated: true,
    status: 'DRAFT',
    isSuperAdminBlog: businessId === 'localboost',
    relatedPostId: relatedPostId || null
  });

  return blog;
};

const getQuery = (businessId, blogId = null) => {
  const query = {};
  if (blogId) query._id = blogId;
  if (businessId === 'localboost') query.isSuperAdminBlog = true;
  else if (businessId) query.businessId = businessId;
  return query;
};

const getBlogs = async (businessId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const dbQuery = getQuery(businessId);

  const blogs = await Blog.find(dbQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedPostId', 'title content');

  const total = await Blog.countDocuments(dbQuery);

  return {
    data: blogs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

const getBlogById = async (businessId, blogId) => {
  const blog = await Blog.findOne(getQuery(businessId, blogId)).populate('relatedPostId', 'title content media');
  if (!blog) throw new AppError('Blog not found', 404);
  return blog;
};

const createBlog = async (businessId, ownerId, data) => {
  const blog = await Blog.create({
    businessId: businessId === 'localboost' ? undefined : businessId,
    isSuperAdminBlog: businessId === 'localboost',
    ownerId,
    ...data
  });
  return blog;
};

const updateBlog = async (businessId, blogId, data) => {
  const blog = await Blog.findOneAndUpdate(
    getQuery(businessId, blogId),
    data,
    { new: true, runValidators: true }
  );
  if (!blog) throw new AppError('Blog not found', 404);
  return blog;
};

const deleteBlog = async (businessId, blogId) => {
  const blog = await Blog.findOneAndDelete(getQuery(businessId, blogId));
  if (!blog) throw new AppError('Blog not found', 404);
  return blog;
};

const uploadCoverImage = async (businessId, blogId, file) => {
  if (!file) throw new AppError('No image file provided.', 400);
  
  const blog = await Blog.findOne(getQuery(businessId, blogId));
  if (!blog) throw new AppError('Blog not found', 404);

  if (blog.coverImage && blog.coverImage.publicId) {
    await deleteFromCloudinary(blog.coverImage.publicId);
  }

  const uploadResult = await uploadToCloudinary(file, {
    folder: `localboost-ai/businesses/${businessId}/blogs`,
    resource_type: 'image',
    width: 1200,
    height: 630,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });

  blog.coverImage = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };
  await blog.save();

  return blog;
};

const generateCoverImage = async (businessId, blogId, prompt) => {
  const blog = await Blog.findOne(getQuery(businessId, blogId));
  if (!blog) throw new AppError('Blog not found', 404);

  // Generate and Upload Image
  const result = await imageGenerationService.generateAndUpload(
    `Cover image for a blog post titled "${blog.title}". Context: ${prompt}. High quality, professional, blog banner style.`,
    { size: '1024x1024' }
  );

  if (!result || !result.url) {
    throw new AppError('Failed to generate image', 500);
  }

  if (blog.coverImage && blog.coverImage.publicId) {
    await deleteFromCloudinary(blog.coverImage.publicId);
  }

  blog.coverImage = {
    url: result.url,
    publicId: result.publicId
  };
  await blog.save();

  return blog;
};

module.exports = {
  generateBlog,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadCoverImage,
  generateCoverImage
};
