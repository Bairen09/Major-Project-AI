import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicBlogById } from '../services/blog.service';
import { 
  BookOpen, Calendar as CalendarIcon, ArrowLeft, 
  Share2, Facebook, Twitter, Linkedin, Link2, 
  MessageSquare, Clock, User, ChevronRight, Tag
} from 'lucide-react';

export default function PublicBlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock data for sidebar
  const categories = [
    { name: 'Engineering', count: 24 },
    { name: 'AI & Automation', count: 18 },
    { name: 'Analytics', count: 12 },
    { name: 'Security', count: 15 },
    { name: 'Marketing', count: 9 },
  ];
  
  const relatedArticles = [
    { title: '5 Strategies to Scale Your API Infrastructure', date: 'Jul 8, 2026', link: '#' },
    { title: 'The Future of Real-Time Analytics in Retail', date: 'Jul 5, 2026', link: '#' },
  ];

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

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return 1;
    const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200)); // 200 words per min
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

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

  const readTime = calculateReadTime(blog.content);
  const authorName = blog.ownerId?.name || 'Anonymous';
  const authorAvatar = blog.ownerId?.avatarUrl;
  
  // Extract simple headings for ToC (Mocked parsing for now)
  const toc = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'key-features', label: 'Key Features' },
    { id: 'benefits', label: 'Benefits & Advantages' },
    { id: 'conclusion', label: 'Conclusion' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans pb-24">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/10 z-50 flex items-center px-6 md:px-12 lg:px-24">
         <Link to="/" className="font-display font-black text-xl tracking-tight flex items-center gap-2">
            <span className="text-[#D4AF37]">LocalBoost</span>
            <span className="text-white">AI</span>
         </Link>
         <div className="ml-auto flex items-center gap-4">
            <Link to="/blogs" className="text-sm font-medium text-white/60 hover:text-white transition-colors">All Blogs</Link>
         </div>
      </nav>

      {/* Main Container */}
      <div className="pt-24 max-w-7xl mx-auto px-6 md:px-12 lg:px-8 xl:px-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Content */}
        <div className="lg:w-2/3 flex flex-col">
          
          {/* Breadcrumb & Category */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-6">
            <Link to="/blogs" className="hover:text-white transition-colors">Blogs</Link>
            <ChevronRight className="h-3 w-3 text-white/40" />
            <span>{blog.isSuperAdminBlog ? 'Platform News' : 'Business Insights'}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8">
            {blog.title}
          </h1>

          {/* Meta & Share Row */}
          <div className="flex flex-wrap items-center justify-between py-6 border-y border-white/10 mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#D4AF37] to-yellow-200 p-[2px]">
                <div className="h-full w-full rounded-full bg-[#111] flex items-center justify-center font-bold text-lg overflow-hidden text-[#D4AF37]">
                  {authorAvatar ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" /> : authorName.charAt(0)}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{authorName}</p>
                <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                  <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readTime} min read</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Share</p>
              <button onClick={copyLink} className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#D4AF37]/50 flex items-center justify-center transition-all text-white/70 hover:text-[#D4AF37]">
                <Link2 className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 flex items-center justify-center transition-all text-white/70 hover:text-[#1DA1F2]">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 flex items-center justify-center transition-all text-white/70 hover:text-[#0A66C2]">
                <Linkedin className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {blog.coverImage?.url && (
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl">
              <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Blog Content HTML */}
          <div 
            className="blog-content mb-16"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.seoKeywords && blog.seoKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-16">
              <Tag className="h-5 w-5 text-[#D4AF37] mr-2" />
              {blog.seoKeywords.map((tag, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Footer Bio */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-6 items-center md:items-start mb-16">
             <div className="h-20 w-20 shrink-0 rounded-full bg-[#111] border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#D4AF37] overflow-hidden">
                {authorAvatar ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" /> : authorName.charAt(0)}
             </div>
             <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-white mb-2">{authorName}</h4>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  We're content makers who are fascinated by technology, engineering, and innovation. Exploring the boundaries of what's possible in the digital space.
                </p>
                <button className="text-sm font-bold text-[#D4AF37] hover:underline">View all posts by {authorName} →</button>
             </div>
          </div>

          {/* Comments Section Placeholder */}
          <div className="border-t border-white/10 pt-12 mb-20">
             <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
               <MessageSquare className="h-6 w-6 text-[#D4AF37]" /> Comments (0)
             </h3>
             <div className="bg-[#111] rounded-2xl p-6 border border-white/5 mb-8">
               <h4 className="text-lg font-bold mb-4">Leave a Comment</h4>
               <textarea 
                 className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none mb-4 h-32" 
                 placeholder="Share your thoughts..."
               />
               <button className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#D4AF37]/90 transition-all">
                 Post Comment
               </button>
             </div>
             <p className="text-white/40 text-center italic">No comments yet. Be the first to comment!</p>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:w-1/3 hidden lg:block">
          <div className="sticky top-24 space-y-12">
            
            {/* Table of Contents */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#D4AF37]" /> Table of Contents
              </h4>
              <ul className="space-y-4">
                {toc.map((item, i) => (
                  <li key={i}>
                    <a href={`#${item.id}`} className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
                       {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Box */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#D4AF37]/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-yellow-500"></div>
              <h4 className="font-bold text-2xl mb-3">Stay Updated</h4>
              <p className="text-sm text-white/60 mb-6">Get the latest posts delivered right to your inbox.</p>
              <input type="email" placeholder="Your email address" className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm focus:outline-none focus:border-[#D4AF37]/50" />
              <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Sign Up
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">Categories</h4>
              <ul className="space-y-3">
                {categories.map((cat, i) => (
                  <li key={i}>
                    <a href="#" className="group flex items-center justify-between text-sm text-white/70 hover:text-white transition-colors">
                      <span className="group-hover:translate-x-1 transition-transform">{cat.name}</span>
                      <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">{cat.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Articles */}
            <div>
              <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">Popular Posts</h4>
              <div className="space-y-6">
                {relatedArticles.map((article, i) => (
                  <a key={i} href={article.link} className="block group">
                    <h5 className="text-sm font-bold text-white/90 group-hover:text-[#D4AF37] transition-colors leading-snug mb-2">
                      {article.title}
                    </h5>
                    <p className="text-xs text-white/50 flex items-center gap-1.5">
                      <CalendarIcon className="h-3 w-3" /> {article.date}
                    </p>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
