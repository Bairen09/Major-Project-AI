import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicBlogById } from '../services/blog.service';
import { BookOpen, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

export default function PublicBlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await getPublicBlogById(id);
        setBlog(res.data.data);
      } catch (err) {
        setError('Blog not found or is no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6">
        <BookOpen className="h-16 w-16 text-white/20 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Blog Not Found</h1>
        <p className="text-white/50 mb-8">{error}</p>
        <Link to="/" className="text-[#D4AF37] hover:underline font-bold inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white pb-24">
      {/* Navbar Minimal (can replace with actual public Navbar if available) */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center px-6">
         <Link to="/" className="font-display font-black text-xl tracking-tight flex items-center gap-2">
            <span className="text-[#D4AF37]">LocalBoost</span>
            <span className="text-white">AI</span>
         </Link>
      </nav>

      {/* Hero / Cover */}
      <div className="pt-16">
        {blog.coverImage?.url ? (
          <div className="w-full h-[40vh] md:h-[50vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0B] z-10" />
            <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 md:h-48 bg-[#111] border-b border-white/5" />
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 -mt-16 md:-mt-32 relative z-20">
        <Link 
          to="/dashboard/blogs" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold transition-all shadow-lg hover:-translate-y-0.5 mb-8"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.isSuperAdminBlog ? (
            <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-wide border border-[#D4AF37]/30">
              LocalBoost
            </span>
          ) : blog.businessId ? (
            <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-bold uppercase tracking-wide border border-white/10">
              {blog.businessId.name}
            </span>
          ) : null}
          <span className="px-3 py-1 bg-white/5 text-white/60 rounded-full text-xs font-medium uppercase tracking-wide border border-white/5 flex items-center gap-1.5">
            <CalendarIcon className="h-3 w-3" /> {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
          {blog.title}
        </h1>

        {/* Author info optional */}
        <div className="flex items-center gap-3 mb-12 pb-12 border-b border-white/10">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
            {blog.ownerId?.avatarUrl ? <img src={blog.ownerId.avatarUrl} alt="author" className="w-full h-full object-cover" /> : blog.ownerId?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{blog.ownerId?.name || 'Anonymous'}</p>
            <p className="text-xs text-white/50">Author</p>
          </div>
        </div>

        {/* Blog HTML Content */}
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Keywords */}
        {blog.seoKeywords && blog.seoKeywords.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {blog.seoKeywords.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-white/60">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
