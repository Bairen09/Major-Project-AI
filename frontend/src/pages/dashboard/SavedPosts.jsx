import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Image as ImageIcon, Copy, Trash2, Eye, X, Edit2, Check, AlertCircle, Share2, Files, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { updatePost as updatePostService } from '../../services/post.service';
import { useBusiness } from '../../context/BusinessContext';
import { getPosts, deletePost, duplicatePost, uploadMedia, deleteMedia } from '../../services/post.service';
import { Link, useNavigate } from 'react-router-dom';
import ScheduleModal from '../../components/dashboard/ScheduleModal';
import ImageViewer from '../../components/dashboard/ImageViewer';
import MediaUploader from '../../components/dashboard/MediaUploader';
import PlatformLogo from '../../components/common/PlatformLogo';
import { toast } from 'sonner';

export default function SavedPosts() {
  const navigate = useNavigate();
  const { activeBusiness: business } = useBusiness();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [localToastMessage, setLocalToastMessage] = useState('');
  
  // Editor State
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [shareMenuPostId, setShareMenuPostId] = useState(null);
  
  // Delete State
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  
  // Schedule State
  const [postToSchedule, setPostToSchedule] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, totalPages: 1 });

  const [viewerImages, setViewerImages] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const PLATFORM_LIMITS = {
    instagram: 2200,
    facebook: 63206,
    google: 1500
  };

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('newest');

  const fetchPosts = async () => {
    if (!business?._id) return;
    setLoading(true);
    try {
      const res = await getPosts(business._id, { page, limit });
      setPosts(res.data.data?.posts || []);
      if (res.data.data?.pagination) {
        setPaginationInfo(res.data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setError("Failed to load saved posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, limit, business?._id]);

  const handleCopy = (post) => {
    const text = `${post.content?.text || post.content}\n\n${(post.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const handleDownloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const handleSharePlatform = (post, platform) => {
    const text = `${post.content?.text || post.content}\n\n${(post.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    toast.success(`Copied content! Opening ${platform}...`);
    
    // Download image if present
    if (post.generatedImage?.url) {
      handleDownloadImage(post.generatedImage.url, `generated-${post._id}.jpg`);
    } else if (post.media && post.media.length > 0) {
      handleDownloadImage(post.media[0].url, `media-${post._id}.jpg`);
    }

    setTimeout(() => {
        if (platform === 'instagram') window.open('https://instagram.com', '_blank');
        else if (platform === 'facebook') window.open('https://facebook.com', '_blank');
        else if (platform === 'google') window.open('https://business.google.com', '_blank');
        else window.open('https://instagram.com', '_blank'); // fallback
    }, 1500);
    setShareMenuPostId(null);
  };

  const confirmDelete = async () => {
    if (!business || !postToDelete) return;
    setIsDeleting(true);
    try {
      await deletePost(business._id, postToDelete._id);
      setPosts(posts.filter(p => p._id !== postToDelete._id));
      setPostToDelete(null);
    } catch (err) {
      alert("Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (post) => {
    if (!business) return;
    
    // Optimistic Update
    const tempId = `temp_${Date.now()}`;
    const optimisticPost = { 
      ...post, 
      _id: tempId, 
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    setPosts(prev => [optimisticPost, ...prev]);
    
    try {
      const res = await duplicatePost(business._id, post._id);
      // Replace temp with real
      setPosts(prev => prev.map(p => p._id === tempId ? res.data.data : p));
    } catch (err) {
      // Revert on failure
      setPosts(prev => prev.filter(p => p._id !== tempId));
      alert("Failed to duplicate post.");
    }
  };

  const openEditor = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title || '',
      content: post.content?.text || post.content || '',
      platform: post.platform || 'instagram',
      hashtags: post.hashtags ? post.hashtags.join(', ') : '',
      media: post.media || [],
      generatedImage: post.generatedImage || null
    });
  };

  const handleUpdate = async () => {
    if (!business || !editingPost) return;
    setSaving(true);
    try {
      const payload = {
        title: editForm.title,
        content: editForm.content,
        platform: editForm.platform,
        hashtags: editForm.hashtags.split(',').map(t => t.trim()).filter(Boolean),
        media: editForm.media,
        generatedImage: editForm.generatedImage
      };
      
      const res = await updatePostService(business._id, editingPost._id, payload);
      setPosts(prev => prev.map(p => p._id === editingPost._id ? res.data.data : p));
      setEditingPost(null);
    } catch (err) {
      alert("Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMedia = async (file) => {
    if (!business || !editingPost) return;
    setUploadingMedia(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadMedia(business._id, editingPost._id, fd);
      const newMedia = res.data.data;
      
      setEditForm(prev => ({
        ...prev,
        media: [...(prev.media || []), newMedia]
      }));
      setPosts(prev => prev.map(p => p._id === editingPost._id ? { ...p, media: [...(p.media || []), newMedia] } : p));
      setLocalToastMessage('Image uploaded successfully.');
      setTimeout(() => setLocalToastMessage(''), 3000);
    } catch (err) {
      toast.error('Failed to upload image.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (publicId) => {
    if (!business || !editingPost) return;
    try {
      await deleteMedia(business._id, editingPost._id, publicId);
      const updatedMedia = editForm.media.filter(m => m.publicId !== publicId);
      
      setEditForm(prev => ({
        ...prev,
        media: updatedMedia
      }));
      setPosts(prev => prev.map(p => p._id === editingPost._id ? { ...p, media: updatedMedia } : p));
      setLocalToastMessage('Image removed.');
      setTimeout(() => setLocalToastMessage(''), 3000);
    } catch (err) {
      toast.error('Failed to remove image.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-400/10 border border-green-400/20';
      case 'scheduled': return 'text-blue-400 bg-blue-400/10 border border-blue-400/20';
      default: return 'text-orange-400 bg-orange-400/10 border border-orange-400/20';
    }
  };

  const filteredPosts = posts.filter(post => {
    const postTitle = post.title || '';
    const postContent = post.content?.text || post.content || '';
    const postHashtags = post.hashtags ? post.hashtags.join(' ') : '';
    
    const searchString = `${postTitle} ${postContent} ${postHashtags}`.toLowerCase();
    const matchesSearch = !searchQuery || searchString.includes(searchQuery.toLowerCase());
    
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    
    const postStatus = post.status || 'draft';
    const matchesStatus = filterStatus === 'all' || postStatus === filterStatus;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return filterDate === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass rounded-xl h-20 w-full animate-pulse flex items-center px-6 gap-6">
            <div className="h-10 w-10 bg-white/10 rounded-lg" />
            <div className="h-4 w-1/3 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded ml-auto" />
            <div className="h-8 w-8 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 text-red-500/50 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">!</div>
        <p className="text-white/80 mb-4">{error}</p>
        <button onClick={fetchPosts} className="text-[#D4AF37] hover:underline">Try Again</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
        <div className="relative glass h-20 w-20 rounded-2xl flex items-center justify-center mb-6">
          <ImageIcon className="h-8 w-8 text-[#D4AF37]" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white tracking-tight mb-3">No Saved Posts Yet</h2>
        <p className="text-white/50 max-w-md mx-auto mb-8">
          Your content library is currently empty. Generate new posts using AI to start building your library.
        </p>
        <Link to="/dashboard/generate" className="btn-cta inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold transition hover:-translate-y-0.5 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)]">
          <Sparkles className="h-4 w-4" /> Go to AI Generator
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Global Toast */}
      {localToastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-green-500/20 text-green-200 border border-green-500/30 px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300">
          <Check className="h-4 w-4" /> {localToastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition">
             <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 rounded-xl flex-shrink-0 overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
            {business?.logo?.url ? (
              <img
                src={business.logo.url}
                alt="Logo"
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span className="text-[#D4AF37] font-bold text-sm" style={{ display: business?.logo?.url ? 'none' : 'flex' }}>
              {business?.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Saved Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and schedule your content library.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-[#D4AF37]/50 outline-none w-[200px] focus:w-[240px] transition-all"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className={`glass h-9 w-9 rounded-xl flex items-center justify-center transition hover:bg-white/10 ${isFilterOpen || filterPlatform !== 'all' || filterStatus !== 'all' || filterDate !== 'newest' ? 'text-[#D4AF37] border-[#D4AF37]/50' : 'text-white/70'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl p-4 shadow-2xl border border-[#D4AF37]/20 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-2 block">Platform</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['all', 'instagram', 'facebook', 'google'].map(p => (
                          <button 
                            key={p}
                            onClick={() => setFilterPlatform(p)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg capitalize transition ${filterPlatform === p ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
                          >
                            {p === 'google' ? 'Google My Business' : p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-2 block">Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['all', 'draft', 'scheduled', 'published'].map(s => (
                          <button 
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg capitalize transition ${filterStatus === s ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/60 mb-2 block">Date</label>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setFilterDate('newest')}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg transition ${filterDate === 'newest' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
                        >
                          Newest
                        </button>
                        <button 
                          onClick={() => setFilterDate('oldest')}
                          className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg transition ${filterDate === 'oldest' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
                        >
                          Oldest
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link to="/dashboard/generate" className="btn-cta inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ml-2">
            <Sparkles className="h-4 w-4" /> New Post
          </Link>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs font-medium text-white/50 uppercase tracking-wider">
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Content Preview</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Created</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPosts.length > 0 ? filteredPosts.map((post, index) => (
              <tr key={post._id} style={{ animationDelay: `${index * 50}ms` }} className="group hover:bg-white/[0.02] transition animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300">
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium border border-white/10 capitalize">
                    {post.platform}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {post.generatedImage?.url ? (
                      <div 
                        className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border border-[#D4AF37]/30"
                        onClick={() => { setViewerImages([{ url: post.generatedImage.url }]); setViewerIndex(0); }}
                      >
                        <img src={post.generatedImage.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="Generated thumbnail" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-[#D4AF37]/20 rounded-lg pointer-events-none" />
                        <div className="absolute top-0.5 right-0.5 bg-black/60 rounded px-1 text-[8px] text-[#D4AF37]">AI</div>
                      </div>
                    ) : post.media && post.media.length > 0 ? (
                      <div 
                        className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group border border-white/10"
                        onClick={() => { setViewerImages(post.media); setViewerIndex(0); }}
                      >
                        <img src={post.media[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="thumbnail" />
                        {post.media.length > 1 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white">
                            +{post.media.length - 1}
                          </div>
                        )}
                      </div>
                    ) : null}
                    <p className="text-sm text-white/90 truncate max-w-[200px] sm:max-w-[250px]">
                      {post.content?.text || post.content}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(post.status)}`}>
                    {post.status || 'Draft'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/50 text-right whitespace-nowrap">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setSelectedPost(post)} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]/60 hover:text-[#D4AF37] transition tooltip" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditor(post)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition tooltip" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleCopy(post)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition tooltip" title="Copy Content">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDuplicate(post)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition tooltip" title="Duplicate">
                      <Files className="h-4 w-4" />
                    </button>
                    {post.status === 'draft' && (
                      <button onClick={() => setPostToSchedule(post)} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg text-white/60 hover:text-[#D4AF37] transition tooltip" title="Schedule">
                        <Calendar className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setPostToDelete(post)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/60 hover:text-red-400 transition" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {post.status === 'scheduled' && (
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShareMenuPostId(shareMenuPostId === post._id ? null : post._id); }} 
                          className={`p-2 rounded-lg transition tooltip ${shareMenuPostId === post._id ? 'bg-green-500/20 text-green-400' : 'hover:bg-green-500/10 text-white/60 hover:text-green-400'}`} 
                          title="Share to Platform"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        {shareMenuPostId === post._id && (
                          <div className="absolute right-0 bottom-full mb-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl p-2 flex items-center gap-2 z-50">
                            <button onClick={(e) => { e.stopPropagation(); handleSharePlatform(post, 'instagram'); }} className="p-2 hover:bg-[#E1306C]/10 rounded-lg transition" title="Share to Instagram">
                              <PlatformLogo platform="instagram" className="h-5 w-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSharePlatform(post, 'facebook'); }} className="p-2 hover:bg-[#1877F2]/10 rounded-lg transition" title="Share to Facebook">
                              <PlatformLogo platform="facebook" className="h-5 w-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSharePlatform(post, 'google'); }} className="p-2 hover:bg-white/10 rounded-lg transition" title="Share to Google">
                              <PlatformLogo platform="google" className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-white/50 text-sm">
                  No posts found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span>Show</span>
            <select 
              value={limit} 
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-[#D4AF37]/50 transition appearance-none"
            >
              <option className="bg-[#1a1612]" value="10">10</option>
              <option className="bg-[#1a1612]" value="20">20</option>
              <option className="bg-[#1a1612]" value="50">50</option>
            </select>
            <span>items per page</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-medium border border-white/10">
              {page} / {paginationInfo.totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (paginationInfo.totalPages || 1)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="relative glass-strong w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 fade-in duration-300">
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6 pr-12">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-2.5 py-1 text-xs font-bold text-[#D4AF37] capitalize border border-[#D4AF37]/20">
                  {selectedPost.platform}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedPost.status)}`}>
                  {selectedPost.status || 'Draft'}
                </span>
              </div>
              <p className="text-sm text-white/40">Created on {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mb-6">
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-white/90">
                {selectedPost.content?.text || selectedPost.content}
              </p>
              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-[#F5D77A] bg-[#D4AF37]/10 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {selectedPost.generatedImage?.url && (
                <div 
                  className="mt-5 rounded-xl overflow-hidden cursor-pointer group border border-[#D4AF37]/20 relative aspect-video"
                  onClick={() => { setViewerImages([{ url: selectedPost.generatedImage.url }]); setViewerIndex(0); }}
                >
                  <img src={selectedPost.generatedImage.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Generated media" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Generated
                  </div>
                </div>
              )}
              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className={`mt-5 pt-5 ${selectedPost.generatedImage?.url ? 'border-t border-white/5' : 'border-t border-white/10'} grid grid-cols-3 sm:grid-cols-4 gap-3`}>
                  {selectedPost.media.map((img, i) => (
                    <div 
                      key={img.publicId} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer group border border-white/10"
                      onClick={() => { setViewerImages(selectedPost.media); setViewerIndex(i); }}
                    >
                       <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="media" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => handleCopy(selectedPost)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition"
              >
                <Copy className="h-4 w-4" /> Copy Content
              </button>
              <button 
                onClick={() => setSelectedPost(null)}
                className="btn-cta inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingPost(null)} />
          <div className="relative glass-strong w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#D4AF37]/20 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto apple-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Edit Post</h2>
              <button onClick={() => setEditingPost(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80">Title (Optional)</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50" placeholder="Internal name for this post" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80">Platform</label>
                  <select value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50 appearance-none capitalize">
                    <option className="bg-[#1a1612]" value="instagram">Instagram</option>
                    <option className="bg-[#1a1612]" value="facebook">Facebook</option>
                    <option className="bg-[#1a1612]" value="google">Google My Business</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/80">Content</label>
                  <span className={`text-[10px] font-bold ${editForm.content.length > PLATFORM_LIMITS[editForm.platform] ? 'text-red-400' : 'text-white/40'}`}>
                    {editForm.content.length} / {PLATFORM_LIMITS[editForm.platform]}
                  </span>
                </div>
                <textarea 
                  value={editForm.content} 
                  onChange={e => setEditForm({...editForm, content: e.target.value})} 
                  rows="6" 
                  className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-sm outline-none transition resize-none ${editForm.content.length > PLATFORM_LIMITS[editForm.platform] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#D4AF37]/50'}`} 
                />
                {editForm.content.length > PLATFORM_LIMITS[editForm.platform] && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Character limit exceeded for {editForm.platform}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80">Hashtags (Comma separated)</label>
                <input type="text" value={editForm.hashtags} onChange={e => setEditForm({...editForm, hashtags: e.target.value})} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50" placeholder="marketing, business, growth" />
              </div>

              {editForm.generatedImage?.url && (
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <label className="text-xs font-medium text-white/80 flex items-center gap-1.5 mb-2"><Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> AI Generated Image</label>
                  
                  <div className="relative aspect-video rounded-xl overflow-hidden glass border border-[#D4AF37]/30 group w-full sm:w-1/2">
                    <img 
                      src={editForm.generatedImage.url} 
                      alt="Generated" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setViewerImages([{ url: editForm.generatedImage.url }]);
                          setViewerIndex(0);
                        }}
                        className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors tooltip"
                        title="View Fullscreen"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeleteImageConfirm(true);
                        }}
                        className="p-2.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors tooltip"
                        title="Remove Image"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-xs font-medium text-white/80 block mb-2">Media</label>
                <MediaUploader 
                  media={editForm.media}
                  isUploading={uploadingMedia}
                  onUpload={handleUploadMedia}
                  onDelete={handleDeleteMedia}
                  onPreview={(imgIndex) => {
                    setViewerImages(editForm.media);
                    setViewerIndex(imgIndex);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
              <button onClick={() => setEditingPost(null)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition">
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={saving || editForm.content.length > PLATFORM_LIMITS[editForm.platform]}
                className="btn-cta inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? "Saving..." : <><Check className="h-4 w-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      {showDeleteImageConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteImageConfirm(false)} />
          <div className="relative glass-strong w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-red-500/20 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Remove AI Image?</h3>
              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to remove this AI generated image from the post?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteImageConfirm(false)} 
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setEditForm(prev => ({ ...prev, generatedImage: null }));
                    setShowDeleteImageConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-[0_5px_15px_-5px_rgba(239,68,68,0.4)] transition hover:-translate-y-0.5"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPostToDelete(null)} />
          <div className="relative glass-strong w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-red-500/20 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Delete Post?</h3>
              <p className="text-sm text-white/60 mb-8">
                Are you sure you want to delete this {postToDelete.platform} post? This action cannot be undone and it will be permanently removed from your library.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setPostToDelete(null)} 
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-[0_5px_15px_-5px_rgba(239,68,68,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal 
        isOpen={!!postToSchedule}
        onClose={() => setPostToSchedule(null)}
        post={postToSchedule}
        businessId={business?._id}
        onSuccess={() => {
          setPostToSchedule(null);
          setLocalToastMessage("Post scheduled successfully!");
          setTimeout(() => setLocalToastMessage(''), 3000);
          fetchPosts();
        }}
      />

      {viewerImages && (
        <ImageViewer 
          images={viewerImages}
          currentIndex={viewerIndex}
          onClose={() => setViewerImages(null)}
          onNavigate={(i) => setViewerIndex(i)}
        />
      )}
    </div>
  );
}
