import React from 'react';

const PlatformLogo = ({ platform, className = "" }) => {
  switch (platform.toLowerCase()) {
    case 'google':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          <path d="M16.671 15.542l.532-3.469h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V5.016s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.623H7.078v3.469h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z" fill="#ffffff"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="5.4" fill="url(#ig-grad)"/>
          <path d="M16.8 3H7.2C4.88 3 3 4.88 3 7.2v9.6C3 19.12 4.88 21 7.2 21h9.6c2.32 0 4.2-1.88 4.2-4.2V7.2C21 4.88 19.12 3 16.8 3zm2.4 13.8c0 1.32-1.08 2.4-2.4 2.4H7.2c-1.32 0-2.4-1.08-2.4-2.4V7.2c0-1.32 1.08-2.4 2.4-2.4h9.6c1.32 0 2.4 1.08 2.4 2.4v9.6z" fill="#ffffff"/>
          <path d="M12 7.8c-2.31 0-4.2 1.89-4.2 4.2s1.89 4.2 4.2 4.2 4.2-1.89 4.2-4.2-1.89-4.2-4.2-4.2zm0 6.6c-1.32 0-2.4-1.08-2.4-2.4s1.08-2.4 2.4-2.4 2.4 1.08 2.4 2.4-1.08 2.4-2.4 2.4z" fill="#ffffff"/>
          <circle cx="16.5" cy="7.5" r="1.1" fill="#ffffff"/>
          <defs>
            <linearGradient id="ig-grad" x1="2.4" y1="21.6" x2="21.6" y2="2.4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f09433" />
              <stop offset="0.25" stopColor="#e6683c" />
              <stop offset="0.5" stopColor="#dc2743" />
              <stop offset="0.75" stopColor="#cc2366" />
              <stop offset="1" stopColor="#bc1888" />
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return (
        <div className={`rounded-full bg-white/10 text-white flex items-center justify-center font-bold uppercase ${className}`}>
          {platform.charAt(0)}
        </div>
      );
  }
};

export default PlatformLogo;
