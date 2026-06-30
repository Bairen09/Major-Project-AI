const assistantService = require('../services/assistant.service');
const AppError = require('../errors/AppError');

const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      throw new AppError('Messages array is required', 400);
    }

    const result = await assistantService.fetchChatResponse({
      businessId: req.params.id,
      messages
    });

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chat
};
