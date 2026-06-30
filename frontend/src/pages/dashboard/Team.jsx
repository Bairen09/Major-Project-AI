import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, UserX, UserPlus, Search, RefreshCw, ChevronDown, Check, X, UserCheck, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBusinesses } from '../../services/business.service';
import { getTeamMembers, inviteMember, changeRole, removeMember, cancelInvitation } from '../../services/team.service';
import { toast } from 'sonner';

const ROLE_BADGES = {
  owner: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  editor: 'bg-green-500/10 text-green-400 border-green-500/20',
  viewer: 'bg-white/10 text-white/70 border-white/20',
};

const formatLastActive = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((new Date() - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString();
};

export default function Team() {
  const { user } = useAuth();
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchTeam = async (business) => {
    if (!business) return;
    try {
      setLoading(true);
      const res = await getTeamMembers(business._id);
      if (res.data?.data?.team) {
        setMembers(res.data.data.team);
      }
    } catch (err) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          setActiveBusiness(businesses[0]);
          fetchTeam(businesses[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error('Email is required');
    
    setInviting(true);
    try {
      await inviteMember(activeBusiness._id, inviteEmail, inviteRole);
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
      fetchTeam(activeBusiness);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await changeRole(activeBusiness._id, memberId, newRole);
      toast.success('Role updated');
      setMembers(prev => prev.map(m => m._id === memberId ? { ...m, role: newRole } : m));
      setEditingRole(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (memberId, isInvite = false) => {
    const msg = isInvite ? 'Are you sure you want to cancel this invitation?' : 'Are you sure you want to remove this member?';
    if (!window.confirm(msg)) return;
    
    try {
      if (isInvite) {
        await cancelInvitation(activeBusiness._id, memberId);
      } else {
        await removeMember(activeBusiness._id, memberId);
      }
      toast.success(isInvite ? 'Invitation cancelled' : 'Member removed');
      setMembers(prev => prev.filter(m => m._id !== memberId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const activeUser = members.find(m => m.email === user.email);
  const activeUserRole = activeUser?.role || 'viewer';
  const canManage = activeUserRole === 'owner' || activeUserRole === 'admin';

  const activeMembers = members.filter(m => m.status === 'active');
  const pendingInvites = members.filter(m => m.status !== 'active');

  const stats = [
    { name: 'Total Members', value: activeMembers.length + pendingInvites.length, icon: Users },
    { name: 'Active Members', value: activeMembers.length, icon: UserCheck },
    { name: 'Pending Invites', value: pendingInvites.length, icon: Clock },
    { name: 'Your Role', value: activeUserRole.charAt(0).toUpperCase() + activeUserRole.slice(1), icon: ShieldAlert },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Team Management</h1>
          <p className="text-white/60 mt-1">Manage your business members and invitations.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-cta inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" /> Invite Member
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass p-5 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-sm text-white/60 mb-1">{stat.name}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
                <Icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Members */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="font-medium text-lg text-white">Active Members</h2>
          <button onClick={() => fetchTeam(activeBusiness)} className="p-2 text-white/50 hover:text-white transition rounded-lg hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {loading && activeMembers.length === 0 ? (
           <div className="p-8 flex justify-center">
             <div className="animate-pulse rounded-full h-8 w-8 border-t-2 border-[#D4AF37] border-solid" />
           </div>
        ) : activeMembers.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-display text-white mb-2">No team members yet</h3>
            <p className="text-sm">Invite your first teammate to start collaborating.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-medium text-white/40 uppercase bg-black/20 tracking-wider">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2">Last Active</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Members List */}
            {activeMembers.map((member) => {
              const isMe = member.email === user.email;
              const canEditThisMember = canManage && !isMe && member.role !== 'owner';
              
              return (
                <div key={member._id} className="p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center hover:bg-white/[0.02] transition">
                  {/* Member Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 text-white font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{member.name}</p>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm">YOU</span>
                        )}
                      </div>
                      <p className="text-white/50 text-xs truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Mobile Meta (Role, Joined, Last Active) */}
                  <div className="md:hidden grid grid-cols-2 gap-2 text-sm">
                    <div>
                       <p className="text-white/40 text-xs mb-1">Role</p>
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium border ${ROLE_BADGES[member.role] || ROLE_BADGES.viewer}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                    </div>
                    <div>
                       <p className="text-white/40 text-xs mb-1">Last Active</p>
                       <p className="text-white/80 text-xs">{formatLastActive(member.lastActive)}</p>
                    </div>
                  </div>

                  {/* Desktop Role */}
                  <div className="hidden md:block col-span-2">
                    {editingRole === member._id ? (
                      <select
                        className="bg-black/50 border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                        defaultValue={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                      >
                        <option value="owner" disabled={activeUserRole !== 'owner'}>Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${ROLE_BADGES[member.role] || ROLE_BADGES.viewer}`}>
                        {member.role}
                      </span>
                    )}
                  </div>

                  {/* Desktop Joined */}
                  <div className="hidden md:block col-span-2 text-sm text-white/60">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </div>

                  {/* Desktop Last Active */}
                  <div className="hidden md:block col-span-2 text-sm text-white/60">
                    {formatLastActive(member.lastActive)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => setEditingRole(member._id)}
                      disabled={!canEditThisMember}
                      className={`btn-glass px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition ${canEditThisMember ? 'hover:text-white' : 'opacity-30 cursor-not-allowed'}`}
                      title={!canEditThisMember ? (isMe ? 'Cannot edit yourself' : 'Cannot edit Owner') : ''}
                    >
                      <Shield className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleRemove(member._id)}
                      disabled={!canEditThisMember}
                      className={`btn-glass px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition ${canEditThisMember ? '!text-red-400 hover:!bg-red-500/10' : 'opacity-30 cursor-not-allowed'}`}
                      title={!canEditThisMember ? (isMe ? 'Cannot remove yourself' : 'Cannot remove Owner') : ''}
                    >
                      <UserX className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <Mail className="h-5 w-5 text-white/40" />
            <h2 className="font-medium text-lg text-white">Pending Invitations</h2>
          </div>
          
          <div className="divide-y divide-white/5">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-medium text-white/40 uppercase bg-black/20 tracking-wider">
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Invited Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {pendingInvites.map((invite) => (
              <div key={invite._id} className="p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center hover:bg-white/[0.02] transition">
                
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <p className="text-white/80 font-medium truncate">{invite.email}</p>
                </div>

                <div className="md:hidden grid grid-cols-2 gap-2 text-sm">
                   <div>
                       <p className="text-white/40 text-xs mb-1">Role</p>
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${ROLE_BADGES[invite.role] || ROLE_BADGES.viewer}`}>
                        {invite.role}
                      </span>
                   </div>
                   <div>
                       <p className="text-white/40 text-xs mb-1">Status</p>
                       <span className="text-yellow-400 text-xs flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Pending</span>
                   </div>
                </div>

                <div className="hidden md:block col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${ROLE_BADGES[invite.role] || ROLE_BADGES.viewer}`}>
                    {invite.role}
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-1.5 col-span-2 text-sm text-yellow-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> Pending
                </div>

                <div className="hidden md:block col-span-2 text-sm text-white/60">
                  {new Date(invite.joinedAt).toLocaleDateString()}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2 mt-2 md:mt-0">
                  {canManage && (
                    <button
                      onClick={() => handleRemove(invite._id, true)}
                      className="btn-glass !text-red-400 hover:!bg-red-500/10 px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel Invite
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-strong border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
              <h3 className="font-display font-semibold text-xl text-white">Invite Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition"
                    placeholder="colleague@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition"
                  >
                    <option value="admin">Admin (Manage everything except settings)</option>
                    <option value="editor">Editor (Create & edit posts)</option>
                    <option value="viewer">Viewer (Read-only access)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white/70 hover:text-white glass hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 btn-cta flex items-center justify-center rounded-xl font-medium py-3"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
