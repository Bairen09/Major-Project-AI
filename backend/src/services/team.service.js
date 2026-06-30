const Business = require('../models/Business');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const notificationService = require('./notification.service');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const ROLES = require('../constants/roles');

const writeAuditLog = async ({ action, userId, businessId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      businessId,
      entity: 'Team',
      entityId,
      status: 'success',
      ...meta,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AuditLog] Failed to write "${action}" log:`, err.message);
    }
  }
};

const inviteMember = async ({ businessId, email, role, inviterId }) => {
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    if (business.ownerId.equals(existingUser._id)) {
      throw new AppError('Cannot invite the business owner.', 400);
    }
    const isAlreadyMember = business.members.some(m => m.userId.equals(existingUser._id));
    if (isAlreadyMember) {
      throw new AppError('User is already a member of this business.', 400);
    }
  }

  const existingInvite = await Invitation.findOne({ 
    businessId, 
    email: email.toLowerCase(),
    status: { $in: ['pending', 'pending_registration'] }
  });

  if (existingInvite) {
    throw new AppError('An invitation has already been sent to this email.', 400);
  }

  const invitation = await Invitation.create({
    businessId,
    email: email.toLowerCase(),
    role,
    status: existingUser ? 'pending' : 'pending_registration',
    invitedBy: inviterId,
  });

  await writeAuditLog({
    action: 'TEAM_MEMBER_INVITED',
    userId: inviterId,
    businessId,
    entityId: invitation._id,
    meta: { invitedEmail: email, role }
  });

  if (existingUser) {
    await notificationService.createNotification({
      userId: existingUser._id,
      businessId,
      title: 'New Invitation',
      message: `You have been invited to join ${business.name} as a ${role}.`,
      type: NOTIFICATION_TYPES.INFO,
      entityType: 'Invitation',
      entityId: invitation._id,
    });
  }

  return invitation.toJSON();
};

const acceptInvitation = async ({ businessId, invitationId, userId }) => {
  const invitation = await Invitation.findOne({ _id: invitationId, businessId, status: { $in: ['pending', 'pending_registration'] } });
  if (!invitation) throw new AppError('Invitation not found or already processed.', 404);

  const user = await User.findById(userId);
  if (user.email.toLowerCase() !== invitation.email) {
    throw new AppError('This invitation belongs to another email address.', 403);
  }

  const business = await Business.findById(businessId);
  business.members.push({
    userId,
    role: invitation.role,
    joinedAt: new Date(),
  });
  await business.save();

  invitation.status = 'accepted';
  await invitation.save();

  await writeAuditLog({
    action: 'TEAM_INVITATION_ACCEPTED',
    userId,
    businessId,
    entityId: invitation._id,
  });

  await notificationService.createNotification({
    userId: invitation.invitedBy,
    businessId,
    title: 'Invitation Accepted',
    message: `${user.name} has accepted the invitation to join the team.`,
    type: NOTIFICATION_TYPES.SUCCESS,
    entityType: 'Business',
    entityId: businessId,
  });

  return business.toJSON();
};

const rejectInvitation = async ({ businessId, invitationId, userId }) => {
  const invitation = await Invitation.findOne({ _id: invitationId, businessId, status: { $in: ['pending', 'pending_registration'] } });
  if (!invitation) throw new AppError('Invitation not found or already processed.', 404);

  const user = await User.findById(userId);
  if (user.email.toLowerCase() !== invitation.email) {
    throw new AppError('This invitation belongs to another email address.', 403);
  }

  invitation.status = 'rejected';
  await invitation.save();

  await writeAuditLog({
    action: 'TEAM_INVITATION_REJECTED',
    userId,
    businessId,
    entityId: invitation._id,
  });

  return { message: 'Invitation rejected.' };
};

const cancelInvitation = async ({ businessId, invitationId, requesterId, requesterRole }) => {
  if (requesterRole !== 'owner' && requesterRole !== 'admin') {
     throw new AppError('You do not have permission to cancel invitations.', 403);
  }

  const invitation = await Invitation.findOne({ _id: invitationId, businessId, status: { $in: ['pending', 'pending_registration'] } });
  if (!invitation) throw new AppError('Invitation not found or already processed.', 404);

  await Invitation.deleteOne({ _id: invitationId });

  await writeAuditLog({
    action: 'TEAM_INVITATION_CANCELLED',
    userId: requesterId,
    businessId,
    entityId: invitationId,
  });

  return { message: 'Invitation cancelled successfully.' };
};

const removeMember = async ({ businessId, memberId, requesterId, requesterRole }) => {
  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.ownerId.equals(memberId)) {
    throw new AppError('Cannot remove the business owner.', 403);
  }

  if (requesterId.toString() === memberId.toString() && requesterRole !== 'owner') {
     // A user can remove themselves unless they are owner (handled above).
  } else if (requesterRole !== 'owner' && requesterRole !== 'admin') {
     throw new AppError('You do not have permission to remove members.', 403);
  }

  const memberIndex = business.members.findIndex(m => m.userId.equals(memberId));
  if (memberIndex === -1) {
    throw new AppError('Team member not found.', 404);
  }

  business.members.splice(memberIndex, 1);
  await business.save();

  await writeAuditLog({
    action: 'TEAM_MEMBER_REMOVED',
    userId: requesterId,
    businessId,
    entityId: memberId,
  });

  await notificationService.createNotification({
    userId: memberId,
    businessId,
    title: 'Removed from Team',
    message: `You have been removed from ${business.name}.`,
    type: NOTIFICATION_TYPES.WARNING,
    entityType: 'Business',
    entityId: businessId,
  });

  return { message: 'Member removed successfully.' };
};

const changeRole = async ({ businessId, memberId, newRole, requesterId, requesterRole }) => {
  if (!Object.values(ROLES).includes(newRole)) {
    throw new AppError('Invalid role specified.', 400);
  }

  const business = await Business.findById(businessId);
  if (!business) throw new AppError('Business not found.', 404);

  if (business.ownerId.equals(memberId)) {
    throw new AppError('Cannot change the role of the business owner.', 403);
  }

  if (requesterId.toString() === memberId.toString()) {
    throw new AppError('You cannot change your own role.', 403);
  }

  const member = business.members.find(m => m.userId.equals(memberId));
  if (!member) {
    throw new AppError('Team member not found.', 404);
  }

  member.role = newRole;
  await business.save();

  await writeAuditLog({
    action: 'TEAM_ROLE_CHANGED',
    userId: requesterId,
    businessId,
    entityId: memberId,
    meta: { newRole }
  });

  await notificationService.createNotification({
    userId: memberId,
    businessId,
    title: 'Role Updated',
    message: `Your role in ${business.name} has been updated to ${newRole}.`,
    type: NOTIFICATION_TYPES.INFO,
    entityType: 'Business',
    entityId: businessId,
  });

  return business.toJSON();
};

const listMembers = async ({ businessId }) => {
  const business = await Business.findById(businessId)
    .populate('ownerId', 'name email avatarUrl lastActive')
    .populate('members.userId', 'name email avatarUrl lastActive');

  if (!business) throw new AppError('Business not found.', 404);

  const invitations = await Invitation.find({ 
    businessId, 
    status: { $in: ['pending', 'pending_registration'] } 
  });

  const team = [
    {
      _id: business.ownerId._id,
      name: business.ownerId.name,
      email: business.ownerId.email,
      avatarUrl: business.ownerId.avatarUrl,
      role: 'owner',
      status: 'active',
      joinedAt: business.createdAt,
      lastActive: business.ownerId.lastActive,
    },
    ...business.members
      .filter(m => !m.userId._id.equals(business.ownerId._id))
      .map(m => ({
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
        role: m.role,
        status: 'active',
        joinedAt: m.joinedAt,
        lastActive: m.userId.lastActive,
      })),
    ...invitations.map(inv => ({
      _id: inv._id,
      name: 'Pending Invite',
      email: inv.email,
      avatarUrl: '',
      role: inv.role,
      status: inv.status,
      joinedAt: inv.createdAt,
      lastActive: null,
    }))
  ];

  return team;
};

const listInvitations = async (email) => {
  const invitations = await Invitation.find({ 
    email: email.toLowerCase(), 
    status: { $in: ['pending', 'pending_registration'] } 
  }).populate('businessId', 'name logoUrl');
  return invitations;
};

module.exports = {
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  removeMember,
  changeRole,
  listMembers,
  listInvitations,
};
