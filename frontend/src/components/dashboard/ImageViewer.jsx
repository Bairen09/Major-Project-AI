import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageViewer({ images, currentIndex, onClose, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images?.length, onClose, onNavigate]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="text-white/70 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        <img 
          src={images[currentIndex]?.url} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/10 text-white transition backdrop-blur-md border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/10 text-white transition backdrop-blur-md border border-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

    </div>
  );
}
