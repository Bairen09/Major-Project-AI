// src/utils/groq.js

const Groq = require('groq-sdk');
const AppError = require('../errors/AppError');

let client = null;

const GROQ_TIMEOUT_MS = 30000;

/**
 * Returns a singleton Groq client.
 * Throws AppError if GROQ_API_KEY is not set.
 */
const getGroqClient = () => {
    if (client) return client;

    if (!process.env.GROQ_API_KEY) {
        throw new AppError('Groq API key is not configured.', 500);
    }

    client = new Groq({
        apiKey: process.env.GROQ_API_KEY,
        timeout: GROQ_TIMEOUT_MS,
    });

    return client;
};

/**
 * Sends a prompt to Groq and returns the response text.
 * Handles rate limiting (429) and timeout errors explicitly.
 *
 * @param {string} prompt
 * @param {Object} options
 * @param {number} options.maxTokens
 * @returns {string}
 */
const complete = async (prompt, { maxTokens = 1000 } = {}) => {
    const groq = getGroqClient();
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    try {
        const response = await groq.chat.completions.create({
            model,
            temperature: 0.8,
            max_tokens: maxTokens,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        if (process.env.NODE_ENV === 'development') {
            const usage = response.usage;
            if (usage) {
                console.log(
                    `[Groq] tokens — prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}, total: ${usage.total_tokens}`
                );
            }
        }

        const text = response.choices?.[0]?.message?.content;

        if (!text) {
            throw new AppError('Groq returned an empty response.', 502);
        }

        return text.trim();
    } catch (err) {
        // Rate limit
        if (err?.status === 429) {
            throw new AppError(
                'AI service is busy. Please try again in a minute.',
                429
            );
        }

        // Timeout
        if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
            throw new AppError(
                'AI service took too long to respond. Please try again.',
                504
            );
        }

        // Re-throw AppErrors as-is
        if (err.isOperational) throw err;

        throw new AppError('AI service is currently unavailable.', 502);
    }
};

module.exports = { complete };