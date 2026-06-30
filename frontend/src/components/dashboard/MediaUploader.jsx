import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaUploader({ media = [], maxFiles = 5, isCover = false, label = "Attached Media", isUploading, onUpload, onDelete, onPreview }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndUpload = (files) => {
    if (!files || files.length === 0) return;
    
    // Only process the first selected file for simplicity, 
    // or handle multiple if needed. Assuming 1 by 1 for now based on UI requirements
    const file = files[0];
    
    if (media.length >= maxFiles) {
      toast.error(`Maximum of ${maxFiles} image${maxFiles > 1 ? 's' : ''} allowed.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported format. Please use JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndUpload(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    validateAndUpload(e.target.files);
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerSelect = () => {
    if (fileInputRef.current && !isUploading && media.length < maxFiles) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/jpg, image/png, image/webp"
        className="hidden"
      />

      {/* State: No Media Yet (Upload Area) */}
      {media.length === 0 && !isUploading && (
        <div 
          onClick={triggerSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDragging 
              ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 mb-3">
            <UploadCloud className="h-6 w-6 text-white/70" />
          </div>
          <p className="text-sm font-medium text-white mb-1">
            Drag & Drop or <span className="text-[#D4AF37]">Browse</span>
          </p>
          <p className="text-xs text-white/50">JPG, PNG, WEBP up to 5MB</p>
        </div>
      )}

      {/* State: Uploading */}
      {isUploading && (
        <div className="flex flex-col items-center justify-center w-full h-40 border border-white/10 rounded-xl bg-white/5">
          <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-3" />
          <p className="text-sm font-medium text-white">Uploading image...</p>
        </div>
      )}

      {/* State: Media Exists */}
      {media.length > 0 && !isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#D4AF37]" />
              {label} {maxFiles > 1 ? `(${media.length}/${maxFiles})` : ''}
            </h4>
            {media.length < maxFiles && (
              <button 
                onClick={triggerSelect}
                className="text-xs font-medium text-[#D4AF37] hover:text-[#F5D77A] transition"
              >
                + Add More
              </button>
            )}
          </div>
          
          <div className={isCover ? "grid grid-cols-1" : "grid grid-cols-3 sm:grid-cols-4 gap-3"}>
            {media.map((img, idx) => (
              <div 
                key={img.publicId || idx}
                className={`group relative ${isCover ? 'aspect-[16/9]' : 'aspect-square'} rounded-xl overflow-hidden border border-white/10 bg-black/50 cursor-pointer`}
                onClick={() => onPreview && onPreview(idx)}
              >
                <img 
                  src={img.url} 
                  alt="Post media" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(img.publicId);
                    }}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-transform hover:scale-110"
                    title="Delete Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
