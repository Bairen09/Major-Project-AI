import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Save, Copy, RotateCcw, AlertCircle, CheckCircle2, ArrowLeft, History, Star, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon, Download, Maximize2, Loader2 } from 'lucide-react';
import { getBusinesses } from '../../services/business.service';
import { generatePost, savePost, uploadMedia, deleteMedia, updatePost, generateImage, regenerateImage } from '../../services/post.service';
import { getPromptHistory, toggleFavoritePrompt, reusePrompt } from '../../services/prompt.service';
import { useNavigate } from 'react-router-dom';
import ScheduleModal from '../../components/dashboard/ScheduleModal';
import MediaUploader from '../../components/dashboard/MediaUploader';
import ImageViewer from '../../components/dashboard/ImageViewer';
import { toast } from 'sonner';

export default function AIGenerator() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  // History state
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    platform: 'instagram',
    goal: 'awareness',
    tone: 'friendly',
    audience: 'Small business owners',
    topic: 'Digital marketing tips',
    count: 3
  });

  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [savingIds, setSavingIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const [generatingImageIds, setGeneratingImageIds] = useState(new Set());

  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState(null);
  
  // Viewer state
  const [viewerImages, setViewerImages] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Layout state
  const [expandedPostIndex, setExpandedPostIndex] = useState(null);

  useEffect(() => {
    const fetchBusinessAndHistory = async () => {
      try {
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
          await loadHistory(businesses[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch business for generator", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchBusinessAndHistory();
  }, []);

  const loadHistory = async (bId) => {
    setHistoryLoading(true);
    try {
      const res = await getPromptHistory(bId);
      // Sort favorites first, then by date
      const sorted = (res.data.data || []).sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setHistory(sorted);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e, customHistoryId = null) => {
    if (e) e.preventDefault();
    if (!business) {
      setError("No active business found. Please create one first.");
      return;
    }
    
    setError('');
    setSuccess('');
    setGenerating(true);
    setResults([]);
    setSavedIds(new Set());
    setExpandedPostIndex(null);
    
    try {
      let payload;
      if (customHistoryId) {
        // Feature 5: Generate from History
        payload = { historyId: customHistoryId };
      } else {
        payload = {
          platform: formData.platform,
          goal: formData.goal,
          topic: formData.topic,
          tone: formData.tone,
          audience: formData.audience,
          count: parseInt(formData.count)
        };
      }
      
      const res = await generatePost(business._id, payload);
      // Make results editable by setting them in state
      setResults(res.data.data.map(p => ({
        ...p,
        platform: formData.platform, // Attach platform for character counting
        media: []
      })) || []);
      
      // Reload history to show new prompt
      if (!customHistoryId) {
        loadHistory(business._id);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to generate content. Please try again.';
      setError(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleFavorite = async (e, promptId) => {
    e.stopPropagation();
    if (!business) return;
    
    // Optimistic UI update
    setHistory(prev => {
      const updated = prev.map(p => p._id === promptId ? { ...p, favorite: !p.favorite } : p);
      return updated.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    try {
      await toggleFavoritePrompt(business._id, promptId);
    } catch (err) {
      // Revert on error
      loadHistory(business._id);
    }
  };

  const handleLoadPrompt = (prompt) => {
    setFormData({
      platform: prompt.platform,
      goal: prompt.goal,
      tone: prompt.tone,
      audience: prompt.audience,
      topic: prompt.topic,
      count: prompt.count
    });
  };

  const handleGenerateAgain = (e, promptId) => {
    e.stopPropagation();
    handleGenerate(null, promptId);
  };

  const handlePostChange = (index, field, value) => {
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleHashtagsChange = (index, value) => {
    setResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], hashtags: value.split(' ').filter(t => t.trim() !== '') };
      return updated;
    });
  };

  const saveAndGetPost = async (post, index) => {
    if (!business) return null;
    setSavingIds(prev => new Set(prev).add(index));
    try {
      const payload = {
        platform: post.platform || formData.platform,
        content: `${post.caption}\n\n${post.callToAction}`,
        hashtags: post.hashtags || []
      };
      
      let res;
      if (post._id) {
        res = await updatePost(business._id, post._id, payload);
      } else {
        res = await savePost(business._id, payload);
      }
      
      setSavedIds(prev => new Set(prev).add(index));
      
      const newPost = res.data.data;
      
      setResults(prev => {
         const updated = [...prev];
         updated[index] = { ...updated[index], _id: newPost._id, media: newPost.media || [] };
         return updated;
      });

      return newPost;
    } catch (err) {
      setError('Failed to save post.');
      setTimeout(() => setError(''), 3000);
      return null;
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const saveSinglePost = async (post, index) => {
    const saved = await saveAndGetPost(post, index);
    if (saved) {
      showToast('Post saved successfully!');
    }
  };

  const handleSaveAll = async () => {
    if (!business || results.length === 0) return;
    // Save all posts, including updating those that have already been saved to capture new edits
    const indexesToSave = results.map((_, i) => i);
    
    indexesToSave.forEach(i => setSavingIds(prev => new Set(prev).add(i)));
    
    try {
      await Promise.all(indexesToSave.map(async (i) => {
        const post = results[i];
        const payload = {
          platform: post.platform || formData.platform,
          content: `${post.caption}\n\n${post.callToAction}`,
          hashtags: post.hashtags || []
        };
        
        let res;
        if (post._id) {
          res = await updatePost(business._id, post._id, payload);
        } else {
          res = await savePost(business._id, payload);
        }
        
        const newPost = res.data.data;
        
        setResults(prev => {
           const updated = [...prev];
           updated[i] = { ...updated[i], _id: newPost._id, media: newPost.media || [] };
           return updated;
        });
        
        setSavedIds(prev => new Set(prev).add(i));
      }));
      showToast('All posts saved successfully!');
    } catch (err) {
      setError('Failed to save some posts.');
      setTimeout(() => setError(''), 3000);
    } finally {
      indexesToSave.forEach(i => setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(i);
        return newSet;
      }));
    }
  };

  const handleCopySingle = (post) => {
    const text = `${post.caption}\n\n${post.callToAction}\n\n${(post.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleCopyAll = () => {
    if (results.length === 0) return;
    const text = results.map((post, i) => `--- Post Option ${i + 1} ---\n\n${post.caption}\n\n${post.callToAction}\n\n${(post.hashtags || []).join(' ')}`).join('\n\n\n');
    navigator.clipboard.writeText(text);
    showToast('All posts copied to clipboard!');
  };

  const openScheduleModal = async (post, index) => {
    let savedPost = post;
    // If not saved, save it first to get an ID
    if (!savedIds.has(index)) {
      savedPost = await saveAndGetPost(post, index);
      if (!savedPost) return;
    } else if (!post._id) {
      savedPost = await saveAndGetPost(post, index);
    }
    
    if (savedPost) {
      if (!savedPost.content) {
         savedPost.content = { text: `${savedPost.caption}\n\n${savedPost.callToAction}` };
      }
      setPostToSchedule(savedPost);
      setScheduleModalOpen(true);
    }
  };

  // ─── Media Management ───

  const handleUploadMedia = async (file, index) => {
    let post = results[index];
    setUploadingIds(prev => new Set(prev).add(index));

    try {
      if (!savedIds.has(index) || !post._id) {
        post = await saveAndGetPost(post, index);
        if (!post) throw new Error("Auto-save failed");
      }

      const fd = new FormData();
      fd.append('image', file);

      const res = await uploadMedia(business._id, post._id, fd);
      const newMedia = res.data.data;

      setResults(prev => {
        const updated = [...prev];
        const media = [...(updated[index].media || []), newMedia];
        updated[index] = { ...updated[index], media };
        return updated;
      });

      showToast('Image uploaded successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload image.';
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleDeleteMedia = async (publicId, index) => {
    const post = results[index];
    if (!post || !post._id) return;
    
    try {
      await deleteMedia(business._id, post._id, publicId);
      
      setResults(prev => {
        const updated = [...prev];
        const media = (updated[index].media || []).filter(m => m.publicId !== publicId);
        updated[index] = { ...updated[index], media };
        return updated;
      });
      
      showToast('Image removed.');
    } catch (err) {
      toast.error('Failed to remove image.');
    }
  };

  // ─── AI Image Generation ───

  const handleGenerateImage = async (index, isRegenerate = false) => {
    let post = results[index];
    setGeneratingImageIds(prev => new Set(prev).add(index));
    setError('');

    try {
      // Must be saved first
      if (!savedIds.has(index) || !post._id) {
        post = await saveAndGetPost(post, index);
        if (!post) throw new Error("Auto-save failed");
      }

      let res;
      if (isRegenerate) {
        res = await regenerateImage(business._id, post._id, { style: business?.settings?.tone || 'friendly' });
      } else {
        res = await generateImage(business._id, post._id, { style: business?.settings?.tone || 'friendly' });
      }

      const updatedPost = res.data.data.post;

      setResults(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], generatedImage: updatedPost.generatedImage };
        return updated;
      });

      showToast(isRegenerate ? 'Image regenerated successfully.' : 'Image generated successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate image.';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setGeneratingImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleDownloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'generated-image.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to download image.");
    }
  };


  const showToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const getCharLimit = (platform) => {
    switch(platform) {
      case 'instagram': return 2200;
      case 'facebook': return 63206; // Practical limit is huge, but let's use 2000 for standard UI
      case 'google': return 1500;
      default: return 2200;
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] relative">
      
      {/* ─── Prompt History Sidebar ─── */}
      <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col glass border-r border-white/5 ${isHistoryOpen ? 'w-[300px] mr-6 opacity-100' : 'w-0 mr-0 opacity-0 border-r-0'}`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <History className="h-4 w-4 text-[#D4AF37]" /> History
          </h3>
          <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto apple-scrollbar p-3 space-y-2">
          {historyLoading ? (
            <div className="animate-pulse space-y-3 p-2">
              <div className="h-16 bg-white/5 rounded-xl"></div>
              <div className="h-16 bg-white/5 rounded-xl"></div>
              <div className="h-16 bg-white/5 rounded-xl"></div>
            </div>
          ) : history.length > 0 ? (
            history.map(item => (
              <div 
                key={item._id} 
                onClick={() => handleLoadPrompt(item)}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{item.platform}</span>
                  <button 
                    onClick={(e) => handleToggleFavorite(e, item._id)}
                    className={`p-1 rounded-md transition ${item.favorite ? 'text-yellow-400' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
                  >
                    <Star className="h-3.5 w-3.5" fill={item.favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <h4 className="text-sm font-medium text-white mb-1 truncate">{item.topic || 'Untitled Prompt'}</h4>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-xs text-white/40">{new Date(item.createdAt).toLocaleDateString()}</span>
                   <button 
                     onClick={(e) => handleGenerateAgain(e, item._id)}
                     className="text-[10px] px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37]/20 flex items-center gap-1"
                   >
                     <RotateCcw className="h-3 w-3" /> Reuse
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-sm text-white/40">
              No prompt history yet.
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Content Area (Form + Results) ─── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto apple-scrollbar pr-2 pb-8">
          <div className="glass-strong rounded-2xl p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition flex-shrink-0 mt-1">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    {business?.logo?.url && (
                       <img src={business.logo.url} alt="Logo" className="h-8 w-8 rounded-lg object-cover border border-white/10 bg-white/5" />
                    )}
                    <h2 className="font-display text-xl font-bold">AI Content Generator</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Create engaging posts in seconds.</p>
                </div>
              </div>
              {!isHistoryOpen && (
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition mt-1"
                  title="View Prompt History"
                >
                  <History className="h-5 w-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80">Platform</label>
                <select name="platform" value={formData.platform} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 appearance-none">
                  <option className="bg-[#1a1612]" value="instagram">Instagram</option>
                  <option className="bg-[#1a1612]" value="facebook">Facebook</option>
                  <option className="bg-[#1a1612]" value="google">Google My Business</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80">Goal</label>
                  <select name="goal" value={formData.goal} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 appearance-none">
                    <option className="bg-[#1a1612]" value="awareness">Brand Awareness</option>
                    <option className="bg-[#1a1612]" value="leads">Lead Generation</option>
                    <option className="bg-[#1a1612]" value="engagement">Engagement</option>
                    <option className="bg-[#1a1612]" value="sales">Sales</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/80">Tone</label>
                  <select name="tone" value={formData.tone} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 appearance-none">
                    <option className="bg-[#1a1612]" value="friendly">Friendly</option>
                    <option className="bg-[#1a1612]" value="professional">Professional</option>
                    <option className="bg-[#1a1612]" value="luxury">Luxury</option>
                    <option className="bg-[#1a1612]" value="fun">Fun</option>
                    <option className="bg-[#1a1612]" value="casual">Casual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80">Target Audience</label>
                <input type="text" name="audience" value={formData.audience} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50" />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Small business owners", "Local customers", "Tech enthusiasts", "Parents", "Students"].map(suggestion => (
                    <button 
                      key={suggestion} 
                      type="button"
                      onClick={() => setFormData({ ...formData, audience: suggestion })}
                      className={`text-[10px] px-2 py-1 rounded-md transition ${formData.audience === suggestion ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-white/80">Topic / Key Message</label>
                <textarea name="topic" value={formData.topic} onChange={handleChange} rows="3" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 resize-none" placeholder="What should this post be about?" required />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Weekend Sale Promotion", "New Product Launch", "Customer Testimonial", "Industry Tips", "Behind the Scenes"].map(suggestion => (
                    <button 
                      key={suggestion} 
                      type="button"
                      onClick={() => setFormData({ ...formData, topic: suggestion })}
                      className={`text-[10px] px-2 py-1 rounded-md transition ${formData.topic === suggestion ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/80">Number of Posts</label>
                <select name="count" value={formData.count} onChange={handleChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 appearance-none">
                  <option className="bg-[#1a1612]" value="1">1 Option</option>
                  <option className="bg-[#1a1612]" value="3">3 Options</option>
                  <option className="bg-[#1a1612]" value="5">5 Options</option>
                </select>
              </div>

              <button type="submit" disabled={generating} className="btn-cta w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 mt-4 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50">
                {generating ? "Generating..." : "Generate Posts"} {!generating && <Sparkles className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Global Notifications */}
          <div className="absolute top-0 left-0 right-0 flex justify-center z-20 pointer-events-none">
            {error && (
              <div className="bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 mt-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 text-green-200 border border-green-500/30 px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 mt-2">
                <CheckCircle2 className="h-4 w-4" /> {success}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto apple-scrollbar pb-8 pr-2">
            {generating ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass rounded-2xl p-6 h-[400px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                      </div>
                      <div className="h-32 w-full bg-white/10 rounded-xl animate-pulse mt-4" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 flex-1 bg-white/10 rounded-xl animate-pulse" />
                      <div className="h-10 flex-1 bg-white/10 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div>
                {/* Bulk Actions Header */}
                <div className="flex items-center justify-between mb-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold">Generated Posts</h3>
                    <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs px-2 py-1 rounded-full font-bold">{results.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopyAll} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 px-4 rounded-xl transition">
                      <Copy className="h-3.5 w-3.5" /> Copy All
                    </button>
                    <button onClick={handleSaveAll} className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium py-2 px-4 rounded-xl transition">
                      <Save className="h-3.5 w-3.5" /> Save All
                    </button>
                  </div>
                </div>

                {results.length === 1 || expandedPostIndex !== null ? (
                  <div className="relative animate-in fade-in zoom-in-95 duration-300">
                    {results.length > 1 && (
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setExpandedPostIndex(null)} className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2 px-4 rounded-xl transition">
                          <ArrowLeft className="h-3.5 w-3.5" /> Back to Grid
                        </button>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                          <button 
                            onClick={() => setExpandedPostIndex(prev => Math.max(0, prev - 1))}
                            disabled={expandedPostIndex === 0}
                            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition text-white"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-[11px] font-bold text-white/60 px-2 w-12 text-center">{expandedPostIndex + 1} of {results.length}</span>
                          <button 
                            onClick={() => setExpandedPostIndex(prev => Math.min(results.length - 1, prev + 1))}
                            disabled={expandedPostIndex === results.length - 1}
                            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition text-white"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {(() => {
                      const post = results[expandedPostIndex !== null ? expandedPostIndex : 0];
                      const i = expandedPostIndex !== null ? expandedPostIndex : 0;
                      const charCount = (post.caption || '').length + (post.callToAction || '').length + (post.hashtags || []).join(' ').length;
                      const limit = getCharLimit(post.platform || formData.platform);
                      const isOverLimit = charCount > limit;

                      return (
                        <div key={i} className="glass rounded-2xl flex flex-col justify-between border border-white/5 overflow-hidden">
                          {/* Header */}
                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                             <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
                               {post.platform || formData.platform}
                             </div>
                             <div className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : 'text-white/40'}`}>
                               {charCount} / {limit} chars
                             </div>
                          </div>
                          
                          {/* Edit Area */}
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1 block">Caption</label>
                              <textarea 
                                value={post.caption}
                                onChange={(e) => handlePostChange(i, 'caption', e.target.value)}
                                className="w-full bg-black/20 border border-transparent hover:border-white/10 focus:border-[#D4AF37]/50 rounded-lg p-3 text-sm leading-relaxed resize-none outline-none transition-colors min-h-[120px]"
                              />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1 block">Call To Action</label>
                                <input 
                                  type="text"
                                  value={post.callToAction}
                                  onChange={(e) => handlePostChange(i, 'callToAction', e.target.value)}
                                  className="w-full bg-black/20 border border-transparent hover:border-white/10 focus:border-[#D4AF37]/50 rounded-lg p-3 text-sm font-medium outline-none transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1 block">Hashtags</label>
                                <input 
                                  type="text"
                                  value={(post.hashtags || []).join(' ')}
                                  onChange={(e) => handleHashtagsChange(i, e.target.value)}
                                  className="w-full bg-black/20 border border-transparent hover:border-white/10 focus:border-[#D4AF37]/50 rounded-lg p-3 text-xs text-[#D4AF37] outline-none transition-colors"
                                />
                              </div>
                            </div>
  
                            {/* AI Image Generation Section */}
                            <div className="pt-4 border-t border-white/5 space-y-3">
                              <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-[#D4AF37]" /> AI Marketing Image
                              </label>
                              
                              {post.generatedImage?.url ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden glass border border-white/10 group">
                                  <img 
                                    src={post.generatedImage.url} 
                                    alt="Generated" 
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Overlay Actions */}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button 
                                      onClick={() => {
                                        setViewerImages([{ url: post.generatedImage.url }]);
                                        setViewerIndex(0);
                                      }}
                                      className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors tooltip"
                                      title="View Fullscreen"
                                    >
                                      <Maximize2 className="h-5 w-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadImage(post.generatedImage.url, `generated-${post._id}.jpg`)}
                                      className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors tooltip"
                                      title="Download"
                                    >
                                      <Download className="h-5 w-5" />
                                    </button>
                                    <button 
                                      onClick={() => handleGenerateImage(i, true)}
                                      disabled={generatingImageIds.has(i)}
                                      className="p-2.5 rounded-full bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50 text-white transition-colors tooltip disabled:opacity-50"
                                      title="Regenerate"
                                    >
                                      {generatingImageIds.has(i) ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCcw className="h-5 w-5" />}
                                    </button>
                                  </div>
                                  {/* Provider Badge */}
                                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-white/80 uppercase tracking-wider border border-white/10">
                                    {post.generatedImage.provider}
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-[21/9] sm:aspect-[21/6] rounded-xl bg-black/20 border border-dashed border-white/10 flex flex-col items-center justify-center p-6 text-center">
                                  <ImageIcon className="h-6 w-6 text-white/20 mb-2" />
                                  <h4 className="text-sm font-medium text-white/80 mb-1">Generate AI Image</h4>
                                  <button 
                                    onClick={() => handleGenerateImage(i)}
                                    disabled={generatingImageIds.has(i) || generating}
                                    className="btn-cta inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg disabled:opacity-50 mt-2"
                                  >
                                    {generatingImageIds.has(i) ? (
                                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                                    ) : (
                                      <><Sparkles className="h-3.5 w-3.5" /> Generate Image</>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
  
                            {/* Media Uploader Section */}
                            <div className="pt-2 border-t border-white/5">
                              <MediaUploader 
                                media={post.media || []}
                                isUploading={uploadingIds.has(i)}
                                onUpload={(file) => handleUploadMedia(file, i)}
                                onDelete={(publicId) => handleDeleteMedia(publicId, i)}
                                onPreview={(imgIndex) => {
                                  setViewerImages(post.media);
                                  setViewerIndex(imgIndex);
                                }}
                              />
                            </div>
  
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 p-4 border-t border-white/5 bg-white/[0.02]">
                            <button onClick={() => handleCopySingle(post)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 rounded-xl transition">
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </button>
                            <button 
                              onClick={() => openScheduleModal(post, i)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium py-2.5 rounded-xl transition"
                            >
                              <CalendarIcon className="h-3.5 w-3.5" /> Schedule
                            </button>
                            <button 
                              onClick={() => saveSinglePost(post, i)} 
                              disabled={savingIds.has(i)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium py-2.5 rounded-xl transition disabled:opacity-50"
                            >
                              {savingIds.has(i) ? "Saving..." : (post._id ? <><Save className="h-3.5 w-3.5" /> Update</> : <><Save className="h-3.5 w-3.5" /> Save</>)}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className={`grid gap-4 ${results.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5'}`}>
                    {results.map((post, i) => (
                      <div 
                        key={i} 
                        onClick={() => setExpandedPostIndex(i)}
                        className="glass rounded-2xl p-4 flex flex-col h-full cursor-pointer border border-white/5 hover:border-[#D4AF37]/50 hover:bg-white/[0.02] transition-all animate-in fade-in slide-in-from-bottom-4 group"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-white/80">{post.platform || formData.platform}</span>
                          <span className="text-[10px] text-white/40 font-medium">Option {i + 1}</span>
                        </div>
                        <div className="flex-1 flex flex-col relative gap-3">
                           <p className="text-xs text-white/70 line-clamp-4 leading-relaxed flex-1">
                             {post.caption}
                           </p>
                           {post.generatedImage?.url ? (
                              <div className="w-full aspect-video rounded-lg overflow-hidden relative border border-white/10">
                                 <img src={post.generatedImage.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="preview" />
                              </div>
                           ) : (
                              <div className="w-full h-20 rounded-lg bg-black/20 border border-white/5 flex flex-col items-center justify-center text-white/20 group-hover:text-[#D4AF37]/50 transition-colors">
                                 <ImageIcon className="h-5 w-5 mb-1" />
                                 <span className="text-[9px] uppercase tracking-wider font-bold">No Image</span>
                              </div>
                           )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 text-center flex items-center justify-center gap-1.5 text-white/40 group-hover:text-[#D4AF37] transition-colors">
                           <Maximize2 className="h-3 w-3" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">Click to Expand</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-[#D4AF37]/5 blur-[100px] pointer-events-none" />
                <div className="relative glass h-24 w-24 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                  <Sparkles className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">AI Content Studio</h3>
                <p className="text-sm text-white/50 max-w-sm mx-auto">
                  Design, edit, and orchestrate your content in one workspace. Fill out the configuration or load from history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {scheduleModalOpen && postToSchedule && business && (
        <ScheduleModal 
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          post={postToSchedule}
          businessId={business._id}
          onSuccess={(scheduledPost) => {
            setScheduleModalOpen(false);
            showToast('Post scheduled successfully!');
            if (scheduledPost) {
               setResults(prev => prev.map(p => p._id === scheduledPost._id ? { ...p, status: scheduledPost.status, scheduledAt: scheduledPost.scheduledAt } : p));
            }
          }}
        />
      )}

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
