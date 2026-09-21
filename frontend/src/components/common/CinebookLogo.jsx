import React from 'react';
import { Link } from 'react-router-dom';

export const CinebookLogo = ({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showWordmark = true,
  showTagline = false,
  isLink = true,
  to = '/',
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  const imageElement = (
    <div className={`relative ${sizeMap[size] || sizeMap.md} rounded-xl overflow-hidden shrink-0 border border-[#e0b45c]/40 shadow-[0_0_12px_rgba(224,180,92,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(224,180,92,0.6)] transition-all duration-300 bg-[#0B0F17]`}>
      <img
        src="/cinebook-logo.png"
        alt="Cinebook Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );

  const content = (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {imageElement}
      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight font-display bg-gradient-to-r from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] bg-clip-text text-transparent leading-tight ${textMap[size] || textMap.md}`}>
            Cinebook
          </span>
          {showTagline ? (
            <span className="text-[10px] font-medium text-[#a8adc9] tracking-wider font-sans -mt-0.5">
              Your Cinematic Journey ✦
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#a8adc9] mt-0.5 font-sans">
              Luxury Cinema
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link to={to} className="inline-block transition-transform">
        {content}
      </Link>
    );
  }

  return content;
};

export default CinebookLogo;
