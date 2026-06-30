import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppleCarousel({ images }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [images]);

  useEffect(() => {
    if (isHovered || images.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          // Reached the end, scroll back to start
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="snap-center shrink-0 w-[90%] md:w-[80%] rounded-3xl overflow-hidden border border-white/10 glass-strong shadow-2xl aspect-[21/9]">
            <img src={src} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {canScrollRight && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
