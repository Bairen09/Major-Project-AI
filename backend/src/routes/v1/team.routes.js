const express = require('express');
const teamController = require('../../controllers/team.controller');
const protect = require('../../middleware/protect');
const requireBusiness = require('../../middleware/requireBusiness');
const requireRole = require('../../middleware/requireRole');
const ROLES = require('../../constants/roles');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

// Global route (no business context needed)
// Wait, this file is mounted at /businesses/:id/team. We need a top-level route for listUserInvitations.
// We will export a generic router for /team as well.

router.get('/', requireBusiness, requireRole(ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER), teamController.listMembers);
router.post('/invite', requireBusiness, requireRole(ROLES.OWNER, ROLES.ADMIN), teamController.inviteMember);

router.patch('/:memberId/role', requireBusiness, requireRole(ROLES.OWNER, ROLES.ADMIN), teamController.changeRole);
router.delete('/:memberId', requireBusiness, requireRole(ROLES.OWNER, ROLES.ADMIN), teamController.removeMember);

router.patch('/invitations/:invitationId/accept', teamController.acceptInvitation);
router.patch('/invitations/:invitationId/reject', teamController.rejectInvitation);
router.delete('/invitations/:invitationId', requireBusiness, requireRole(ROLES.OWNER, ROLES.ADMIN), teamController.cancelInvitation);

module.exports = router;
