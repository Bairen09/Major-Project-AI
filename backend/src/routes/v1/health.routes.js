const express = require('express');
const router = express.Router();
const { sendSuccess } = require('../../utils/apiResponse');

router.get('/', (req, res) => {
  return sendSuccess(res, 'Server is running', {
    service: 'LocalBoost AI Backend',
    version: '1.0.0',
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

module.exports = router;
