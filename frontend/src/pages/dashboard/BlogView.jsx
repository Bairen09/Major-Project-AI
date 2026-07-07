import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Clock, Share2, Calendar, Globe, Facebook, Instagram } from 'lucide-react';
import { getBusinesses } from '../../services/business.service';
import { getBlogById, deleteBlog } from '../../services/blog.service';
import { toast } from 'sonner';

export default function BlogView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          const biz = businesses[0];
          setBusiness(biz);
          const res = await getBlogById(biz._id, id);
          setBlog(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch blog", err);
        toast.error("Failed to load blog");
        navigate('/dashboard/blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(business._id, blog._id);
      toast.success("Blog deleted successfully");
      navigate('/dashboard/blogs');
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const handleShare = (platform) => {
    const text = `Check out our new blog post: ${blog.title}`;
    // Simple intent links for sharing a blog post URL (we don't have public URLs yet, so this is just a stub for now)
    // We will copy the content instead for Facebook/Google/Insta
    navigator.clipboard.writeText(`${blog.title}\n\n${blog.content.replace(/<[^>]+>/g, '')}`);
    toast.success("Blog content copied to clipboard!");
    
    setTimeout(() => {
        if (platform === 'instagram') window.open('https://instagram.com', '_blank');
        if (platform === 'facebook') window.open('https://facebook.com', '_blank');
        if (platform === 'google') window.open('https://business.google.com', '_blank');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-12">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/dashboard/blogs')}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </button>
        <div className="flex items-center gap-2">
           <Link 
             to={`/dashboard/blogs/${blog._id}/edit`}
             className="btn-outline inline-flex items-center gap-2 rounded-xl py-2 px-4 text-xs font-medium"
           >
             <Edit3 className="h-4 w-4" /> Edit
           </Link>
           <button 
             onClick={handleDelete}
             className="inline-flex items-center gap-2 rounded-xl py-2 px-4 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
           >
             <Trash2 className="h-4 w-4" /> Delete
           </button>
        </div>
      </div>

      {/* Blog Header */}
      <div className="glass rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
        {/* Optional Cover Image Background overlay */}
        {blog.coverImage?.url && (
            <div className="absolute inset-0 z-0">
                <img src={blog.coverImage.url} alt="Cover" className="w-full h-full object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent"></div>
            </div>
        )}
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg ${blog.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300 border border-green-500/20' : 'bg-white/10 text-white/70 border border-white/10'}`}>
                    {blog.status}
                </span>
                {blog.aiGenerated && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> AI Generated
                    </span>
                )}
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
                {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60 font-medium">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {Math.ceil(blog.content.length / 1000)} min read
                </div>
            </div>
        </div>
      </div>

      {/* Blog Content & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        
        {/* Main Content */}
        <div className="flex-1 glass rounded-3xl p-8 md:p-12 border border-white/5">
            {blog.coverImage?.url && (
                <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                    <img src={blog.coverImage.url} alt="Cover" className="w-full max-h-[400px] object-cover" />
                </div>
            )}

            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
        </div>

        {/* Sidebar Actions */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <div className="glass rounded-2xl p-6 border border-white/5 sticky top-24">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[#D4AF37]" /> Share Blog
                </h3>
                <p className="text-sm text-white/50 mb-6">
                    Copy the content and open your social platforms to share this blog with your audience.
                </p>
                <div className="space-y-3">
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center justify-center gap-3 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/20 py-3 px-4 rounded-xl text-sm font-bold transition">
                        <Facebook className="h-4 w-4" /> Share to Facebook
                    </button>
                    <button onClick={() => handleShare('instagram')} className="w-full flex items-center justify-center gap-3 bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 border border-[#E1306C]/20 py-3 px-4 rounded-xl text-sm font-bold transition">
                        <Instagram className="h-4 w-4" /> Share to Instagram
                    </button>
                    <button onClick={() => handleShare('google')} className="w-full flex items-center justify-center gap-3 bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 py-3 px-4 rounded-xl text-sm font-bold transition">
                        <Globe className="h-4 w-4" /> Share to Google
                    </button>
                </div>
            </div>
        </div>

      </div>

    </div>
  );
}
