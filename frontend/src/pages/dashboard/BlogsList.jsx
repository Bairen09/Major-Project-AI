import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles, BookOpen, Clock, Calendar as CalendarIcon, ArrowRight, Trash2, Edit3, Eye } from 'lucide-react';
import { getBusinesses } from '../../services/business.service';
import { getBlogs, deleteBlog, getPublicBlogs } from '../../services/blog.service';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function BlogsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : 'my_company'); // 'my_company', 'other_companies', 'localboost'
  
  const basePath = user?.platformRole === 'SUPER_ADMIN' ? '/admin/blogs' : '/dashboard/blogs';

  useEffect(() => {
    const fetchBlogsList = async () => {
      setLoading(true);
      try {
        if (user?.platformRole === 'SUPER_ADMIN') {
          let res;
          if (activeTab === 'localboost') {
             res = await getPublicBlogs({ isSuperAdminBlog: true });
          } else {
             res = await getPublicBlogs({});
          }
          setBlogs(res?.data?.data?.blogs || []);
          return;
        }
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          const biz = businesses[0];
          setBusiness(biz);
          
          let res;
          if (activeTab === 'my_company') {
            res = await getBlogs(biz._id);
            setBlogs(res.data.data.data || []);
          } else if (activeTab === 'other_companies') {
             res = await getPublicBlogs({ excludeBusinessId: biz._id });
             setBlogs(res.data.data.blogs || []);
          } else if (activeTab === 'localboost') {
             res = await getPublicBlogs({ isSuperAdminBlog: true });
             setBlogs(res.data.data.blogs || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogsList();
  }, [activeTab]);

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      // Pass null for businessId if super admin
      await deleteBlog(user?.platformRole === 'SUPER_ADMIN' ? 'localboost' : business?._id, blogId);
      setBlogs(blogs.filter(b => b._id !== blogId));
      toast.success("Blog deleted successfully");
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const getExcerpt = (htmlContent) => {
    // Strip HTML tags for excerpt
    if (!htmlContent) return 'No content...';
    const text = htmlContent.replace(/<[^>]+>/g, ' ');
    return text.substring(0, 120) + (text.length > 120 ? '...' : '');
  };

  // Generate SEO friendly URL
  const getSeoUrl = (id, title) => {
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'post';
    return `/blog/${id}/${slug}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-[#D4AF37]" />
            Blog CMS
          </h1>
          <p className="text-muted-foreground mt-1">Manage, write, and generate SEO-optimized blogs.</p>
        </div>
        
        {((activeTab === 'my_company') || (user?.platformRole === 'SUPER_ADMIN' && activeTab === 'localboost')) && (
          <div className="flex items-center gap-3">
            <Link 
              to={`${basePath}/new?mode=manual`}
              className="btn-outline inline-flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium transition"
            >
              <Plus className="h-4 w-4" /> Write Manual
            </Link>
            <Link 
              to={`${basePath}/new?mode=ai`}
              className="btn-cta inline-flex items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" /> AI Generate
            </Link>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto apple-scrollbar">
        {user?.platformRole !== 'SUPER_ADMIN' && (
          <button 
            onClick={() => setActiveTab('my_company')} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'my_company' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            My Company
          </button>
        )}
        <button 
          onClick={() => setActiveTab('other_companies')} 
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'other_companies' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
        >
          Other Companies
        </button>
        <button 
          onClick={() => setActiveTab('localboost')} 
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'localboost' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
        >
          LocalBoost 
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
           <div className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl"><BookOpen className="h-6 w-6" /></div>
           <div>
             <p className="text-sm text-white/60 font-medium">Total Blogs</p>
             <h3 className="text-2xl font-bold">{blogs.length}</h3>
           </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
           <div className="p-3 bg-green-500/10 text-green-400 rounded-xl"><Eye className="h-6 w-6" /></div>
           <div>
             <p className="text-sm text-white/60 font-medium">Published</p>
             <h3 className="text-2xl font-bold">{blogs.filter(b => b.status === 'PUBLISHED').length}</h3>
           </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Clock className="h-6 w-6" /></div>
           <div>
             <p className="text-sm text-white/60 font-medium">Drafts</p>
             <h3 className="text-2xl font-bold">{blogs.filter(b => b.status === 'DRAFT').length}</h3>
           </div>
        </div>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center border-dashed border border-white/10 mt-8">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-white/20" />
          </div>
          <h2 className="text-xl font-bold mb-2">No blogs found</h2>
          <p className="text-white/50 max-w-sm mx-auto mb-8">
            {activeTab === 'my_company' || (user?.platformRole === 'SUPER_ADMIN' && activeTab === 'localboost') ? "You haven't created any blogs yet. Boost your local SEO by publishing consistent content." : "No blogs found in this category yet."}
          </p>
          {(activeTab === 'my_company' || (user?.platformRole === 'SUPER_ADMIN' && activeTab === 'localboost')) && (
            <div className="flex gap-4">
              <Link to={`${basePath}/new?mode=ai`} className="btn-cta inline-flex items-center gap-2 rounded-xl py-3 px-6 font-bold shadow-lg shadow-[#D4AF37]/20 transition-all hover:-translate-y-1">
                 <Sparkles className="h-5 w-5" /> Generate First Blog
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog._id} className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-[#D4AF37]/30 transition-colors">
              {/* Cover Image Placeholder */}
              <div className="h-40 bg-[#111] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                {blog.coverImage?.url ? (
                  <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-white/10" />
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${blog.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300 border border-green-500/20' : 'bg-white/10 text-white/70 border border-white/10'}`}>
                    {blog.status}
                  </span>
                  {blog.aiGenerated && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> AI
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-[#D4AF37] transition-colors">
                  <Link to={getSeoUrl(blog._id, blog.title)}>{blog.title}</Link>
                </h3>
                <p className="text-sm text-white/60 line-clamp-3 mb-4 flex-1">
                  {getExcerpt(blog.content)}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {(activeTab === 'my_company' || (user?.platformRole === 'SUPER_ADMIN' && activeTab === 'localboost')) && (
                      <>
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/50 transition-colors tooltip"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link 
                          to={`${basePath}/${blog._id}/edit`}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors tooltip"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Prominent Read Button */}
                <Link 
                  to={getSeoUrl(blog._id, blog.title)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-[#D4AF37]/10 text-white/80 hover:text-[#D4AF37] border border-white/5 hover:border-[#D4AF37]/20 transition-all font-bold text-sm group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]"
                >
                  Read Blog <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
