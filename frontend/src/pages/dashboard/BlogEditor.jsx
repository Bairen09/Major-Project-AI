import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Loader2, Upload, Trash2 } from 'lucide-react';
import { getBusinesses } from '../../services/business.service';
import { getBlogById, createBlog, updateBlog, generateBlog, uploadBlogCover, generateBlogCover } from '../../services/blog.service';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// Custom Modal Component for Publish Confirmation
const PublishModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl shadow-[#D4AF37]/10 animate-in zoom-in-95 duration-200">
        <h3 className="font-display text-2xl font-bold mb-3 text-white">Publish Blog?</h3>
        <p className="text-white/60 mb-8 text-sm">
          Are you sure you want to publish this blog? Once published, it will be visible to your audience and search engines.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-cta px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#D4AF37]/20 transition-transform hover:-translate-y-0.5">
            Yes, Publish Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BlogEditor() {
  const { id } = useParams(); // May be undefined if route is exactly /dashboard/blogs/new
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { user } = useAuth();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'DRAFT',
    seoKeywords: '',
    isSuperAdminBlog: false,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    const fetchBusinessAndBlog = async () => {
      try {
        let currentBizId = 'localboost';

        if (user?.platformRole !== 'SUPER_ADMIN') {
          const { data: { data: businesses } } = await getBusinesses();
          if (businesses && businesses.length > 0) {
            const biz = businesses[0];
            setBusiness(biz);
            currentBizId = biz._id;
          } else {
            throw new Error("No business found");
          }
        }
        
        if (id && id !== 'new') {
          const res = await getBlogById(currentBizId, id);
          const blog = res.data.data;
          setFormData({
            title: blog.title || '',
            content: blog.content || '',
            status: blog.status || 'DRAFT',
            seoKeywords: blog.seoKeywords ? blog.seoKeywords.join(', ') : '',
            isSuperAdminBlog: blog.isSuperAdminBlog || false,
          });
          if (blog.coverImage) setCoverImage(blog.coverImage);
        }
      } catch (err) {
        toast.error("Failed to load blog");
        const basePath = user?.platformRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
        navigate(`${basePath}/blogs`);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessAndBlog();
  }, [id, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = async (status = 'DRAFT') => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required.");
      return null;
    }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        status,
        seoKeywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      const currentBizId = user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : business?._id;

      if (id && id !== 'new') {
        await updateBlog(currentBizId, id, payload);
        toast.success("Blog updated successfully");
        return id;
      } else {
        const res = await createBlog(currentBizId, payload);
        toast.success("Blog created successfully");
        const basePath = user?.platformRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
        navigate(`${basePath}/blogs/${res.data.data._id}/edit`, { replace: true });
        return res.data.data._id;
      }
    } catch (err) {
      toast.error("Failed to save blog");
      return null;
    } finally {
      setSaving(false);
      setPublishModalOpen(false);
    }
  };

  const handlePublishConfirm = () => {
    handleSave('PUBLISHED');
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a summary or prompt for the AI.");
      return;
    }

    setGenerating(true);
    try {
      const currentBizId = user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : business?._id;
      const res = await generateBlog(currentBizId, { prompt: aiPrompt });
      const newBlog = res.data.data;
      
      setFormData({
        title: newBlog.title,
        content: newBlog.content,
        status: newBlog.status,
        seoKeywords: newBlog.seoKeywords ? newBlog.seoKeywords.join(', ') : '',
        isSuperAdminBlog: formData.isSuperAdminBlog,
      });
      toast.success("Blog generated successfully! You can now edit it.");
      
      if (!id || id === 'new') {
         const basePath = user?.platformRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
         navigate(`${basePath}/blogs/${newBlog._id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate blog");
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let targetBlogId = id;
    if (!targetBlogId || targetBlogId === 'new') {
      toast.info("Saving draft before uploading image...");
      targetBlogId = await handleSave('DRAFT');
      if (!targetBlogId) return;
    }

    setUploadingImage(true);
    try {
      const currentBizId = user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : business?._id;
      const res = await uploadBlogCover(currentBizId, targetBlogId, file);
      setCoverImage(res.data.data.coverImage);
      toast.success("Cover image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateCover = async () => {
    let targetBlogId = id;
    if (!targetBlogId || targetBlogId === 'new') {
      toast.info("Saving draft before generating image...");
      targetBlogId = await handleSave('DRAFT');
      if (!targetBlogId) return;
    }

    setGeneratingImage(true);
    try {
      const currentBizId = user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : business?._id;
      const res = await generateBlogCover(currentBizId, targetBlogId, formData.title || "Blog post");
      setCoverImage(res.data.data.coverImage);
      toast.success("AI Cover image generated!");
    } catch (err) {
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => {
            const basePath = user?.platformRole === 'SUPER_ADMIN' ? '/admin' : '/dashboard';
            navigate(`${basePath}/blogs`);
          }} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition tooltip" title="Back to Blogs">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              {id && id !== 'new' ? 'Edit Blog' : 'Create New Blog'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Write your content or let AI do the heavy lifting.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('DRAFT')}
            disabled={saving || generating}
            className="btn-outline inline-flex items-center gap-2 rounded-xl py-2 px-4 text-sm font-medium hover:bg-white/5 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
          </button>
          <button 
            onClick={() => setPublishModalOpen(true)}
            disabled={saving || generating}
            className="btn-cta inline-flex items-center gap-2 rounded-xl py-2 px-4 text-sm font-bold shadow-lg shadow-[#D4AF37]/20 transition-transform hover:-translate-y-0.5 hover:shadow-[#D4AF37]/40 disabled:opacity-50"
          >
            Publish Blog
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Editor Main Area */}
        <div className="flex-1 space-y-6">
          <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-medium text-white/80 uppercase tracking-wider mb-2 block">Blog Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className="w-full bg-transparent border-b-2 border-white/10 focus:border-[#D4AF37] px-2 py-4 text-3xl md:text-4xl font-display font-bold outline-none transition-colors placeholder:text-white/20"
                    placeholder="Enter an engaging title..."
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-white/80 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Content (HTML / Text)</span>
                  </label>
                  <textarea 
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full h-[600px] bg-black/20 border border-white/10 rounded-2xl p-6 text-base leading-relaxed outline-none focus:border-[#D4AF37]/50 transition-colors resize-y apple-scrollbar font-sans shadow-inner"
                    placeholder="Start writing your blog post here, or use the AI generator on the right..."
                  />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar / AI Tools */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
           
           {/* AI Generator Panel */}
           <div className={`glass rounded-3xl p-6 border ${mode === 'ai' || (!id || id === 'new') ? 'border-[#D4AF37]/30 shadow-[0_0_30px_-10px_rgba(212,175,55,0.2)]' : 'border-white/5'}`}>
              <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" /> AI Writer
              </h3>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">Type a short summary of what you want the blog to be about, and OpenAI will write an SEO-optimized post.</p>
              
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#D4AF37]/50 transition-colors resize-none mb-4 placeholder:text-white/20"
                placeholder="E.g., Write a blog about our new Cafe Mocha launch. Mention it's perfect for winter..."
              />

              <button 
                onClick={handleAIGenerate}
                disabled={generating || saving}
                className="w-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 hover:shadow-lg hover:shadow-[#D4AF37]/10"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 
                {generating ? 'Writing...' : 'Generate Blog'}
              </button>
           </div>

           {/* Settings Panel */}
           <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
              <h3 className="font-display font-bold text-lg mb-2">Media & Settings</h3>
              
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Cover Image</label>
                
                {coverImage?.url ? (
                  <div className="relative rounded-xl overflow-hidden group border border-white/10 aspect-video mb-3">
                    <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-md transition tooltip" title="Replace">
                        <Upload className="h-4 w-4" />
                      </button>
                      <button onClick={() => setCoverImage(null)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg backdrop-blur-md transition tooltip" title="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#D4AF37]/30 hover:bg-white/5 transition cursor-pointer group mb-3"
                  >
                     {uploadingImage ? (
                       <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-2" />
                     ) : (
                       <ImageIcon className="h-8 w-8 text-white/20 group-hover:text-[#D4AF37] mb-2 transition" />
                     )}
                     <span className="text-sm font-medium text-white/60 group-hover:text-white transition">Upload Image</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <button 
                  onClick={handleGenerateCover}
                  disabled={generatingImage || saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition disabled:opacity-50"
                >
                  {generatingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {generatingImage ? 'Generating...' : 'AI Generate Cover'}
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">SEO Keywords</label>
                <input 
                  type="text" 
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-white/20"
                  placeholder="e.g. coffee, local shop..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">Status</label>
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-bold text-lg"
                >
                  <option className="bg-[#1a1612]" value="DRAFT">Draft (Hidden)</option>
                  <option className="bg-[#1a1612]" value="PUBLISHED">Published (Live)</option>
                </select>
                
                {user?.platformRole === 'SUPER_ADMIN' && (
                  <div className="flex items-center gap-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-3 rounded-xl mt-4">
                    <input
                      type="checkbox"
                      id="isSuperAdminBlog"
                      name="isSuperAdminBlog"
                      checked={formData.isSuperAdminBlog}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 checked:bg-[#D4AF37] checked:border-[#D4AF37] cursor-pointer"
                    />
                    <label htmlFor="isSuperAdminBlog" className="text-sm font-bold text-[#D4AF37] cursor-pointer">
                      Publish as LocalBoost (Global Super Admin Blog)
                    </label>
                  </div>
                )}
              </div>
           </div>
        </div>

      </div>

      <PublishModal 
        isOpen={publishModalOpen} 
        onClose={() => setPublishModalOpen(false)} 
        onConfirm={handlePublishConfirm} 
      />
    </div>
  );
}
