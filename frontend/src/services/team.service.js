import api from './api';

export const getTeamMembers = (businessId) => {
  return api.get(`/businesses/${businessId}/team`);
};

export const inviteMember = (businessId, email, role) => {
  return api.post(`/businesses/${businessId}/team/invite`, { email, role });
};

export const changeRole = (businessId, memberId, role) => {
  return api.patch(`/businesses/${businessId}/team/${memberId}/role`, { role });
};

export const removeMember = (businessId, memberId) => {
  return api.delete(`/businesses/${businessId}/team/${memberId}`);
};

export const acceptInvitation = (businessId, invitationId) => {
  return api.patch(`/businesses/${businessId}/team/invitations/${invitationId}/accept`);
};

export const rejectInvitation = (businessId, invitationId) => {
  return api.patch(`/businesses/${businessId}/team/invitations/${invitationId}/reject`);
};

export const cancelInvitation = (businessId, invitationId) => {
  return api.delete(`/businesses/${businessId}/team/invitations/${invitationId}`);
};

export const getUserInvitations = () => {
  return api.get(`/users/invitations`);
};
