const express = require('express');
const assistantController = require('../../controllers/assistant.controller');
const protect = require('../../middleware/protect');
const requireBusiness = require('../../middleware/requireBusiness');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);
router.use(requireBusiness);

// All roles can use the assistant, but we restrict it to valid roles
router.post('/chat', requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER), assistantController.chat);

module.exports = router;
