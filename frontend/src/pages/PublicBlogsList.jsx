import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicBlogs } from '../services/blog.service';
import { ArrowLeft, Calendar, User, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function PublicBlogsList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await getPublicBlogs({ isSuperAdminBlog: true, page, limit: 9 });
        setBlogs(res.data.data.blogs);
        setPagination(res.data.data.pagination);
      } catch (err) {
        setError('Failed to fetch blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page]);

  const getSeoUrl = (id, title) => {
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'post';
    return `/blog/${id}/${slug}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#1a1612] to-[#0A0A0B] pt-24 pb-16 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-medium text-white/70 hover:text-white transition-colors mb-10 group">
            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Latest <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover our latest strategies, updates, and tips to grow your business with LocalBoost AI.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-white/60 flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-white/20 mb-4" />
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-white/60 flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-white/20 mb-4" />
            <p>No blogs published yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog._id} to={getSeoUrl(blog._id, blog.title)} className="group block glass rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
                  {blog.coverImage?.url ? (
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-white/5 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-xs font-medium text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      {blog.ownerId?.name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {blog.ownerId.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">{blog.title}</h3>
                    <div className="text-sm text-white/60 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 150) + '...' }} />
                    <span className="text-[#D4AF37] text-sm font-semibold inline-flex items-center gap-1">
                      Read Article <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-white/60 font-medium">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
