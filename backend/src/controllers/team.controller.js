const teamService = require('../services/team.service');

const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const invitation = await teamService.inviteMember({
      businessId: req.params.id,
      email,
      role,
      inviterId: req.user.id,
    });
    res.status(201).json({ status: 'success', data: { invitation } });
  } catch (err) {
    next(err);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const business = await teamService.acceptInvitation({
      businessId: req.params.id,
      invitationId: req.params.invitationId,
      userId: req.user.id,
    });
    res.status(200).json({ status: 'success', data: { business } });
  } catch (err) {
    next(err);
  }
};

const rejectInvitation = async (req, res, next) => {
  try {
    const result = await teamService.rejectInvitation({
      businessId: req.params.id,
      invitationId: req.params.invitationId,
      userId: req.user.id,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    const result = await teamService.cancelInvitation({
      businessId: req.params.id,
      invitationId: req.params.invitationId,
      requesterId: req.user.id,
      requesterRole: req.businessRole,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await teamService.removeMember({
      businessId: req.params.id,
      memberId: req.params.memberId,
      requesterId: req.user.id,
      requesterRole: req.businessRole,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const business = await teamService.changeRole({
      businessId: req.params.id,
      memberId: req.params.memberId,
      newRole: role,
      requesterId: req.user.id,
      requesterRole: req.businessRole,
    });
    res.status(200).json({ status: 'success', data: { business } });
  } catch (err) {
    next(err);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const team = await teamService.listMembers({ businessId: req.params.id });
    res.status(200).json({ status: 'success', data: { team } });
  } catch (err) {
    next(err);
  }
};

const listUserInvitations = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    const invitations = await teamService.listInvitations(user.email);
    res.status(200).json({ status: 'success', data: { invitations } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  removeMember,
  changeRole,
  listMembers,
  listUserInvitations,
};
