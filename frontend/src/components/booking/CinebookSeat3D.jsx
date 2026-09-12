import React from 'react';

/**
 * CinebookSeat3D - 3D Isometric Animated Cinebook Emblem
 * Displayed on selected seats instead of a standard 2D checkmark.
 * Features 3D perspective depth, floating bobbing oscillation, specular sheen, and glowing amber neon aura.
 */
const CinebookSeat3D = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6 sm:w-7 sm:h-7',
    lg: 'w-8 h-8 sm:w-9 sm:h-9'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center pointer-events-none select-none ${currentSize} ${className}`}
      style={{ perspective: '500px' }}
    >
      {/* 1. Ambient 3D Glowing Halo Ring */}
      <span
        className="absolute inset-0 rounded-full bg-brand/30 blur-xs animate-ping opacity-40 pointer-events-none"
        style={{ animationDuration: '2.5s' }}
      />

      {/* 2. 3D Preserved Transform Container with Float & Tilt */}
      <div className="w-full h-full cinebook-3d-container flex items-center justify-center">
        <div className="w-full h-full cinebook-3d-active flex items-center justify-center">
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          >
            <defs>
              {/* Gold / Electric Amber 3D Face Gradient */}
              <linearGradient id="cine3dGoldTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="35%" stopColor="#FDE047" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* 3D Dark Void Extrusion Gradient */}
              <linearGradient id="cine3dExtrude" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B0D13" />
                <stop offset="100%" stopColor="#040507" />
              </linearGradient>

              {/* High-Gloss Specular Shimmer */}
              <linearGradient id="cine3dShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Film Strip Gradient */}
              <linearGradient id="cine3dFilm" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#060709" />
                <stop offset="50%" stopColor="#12141C" />
                <stop offset="100%" stopColor="#060709" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="cineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- 3D ISOMETRIC CINEMA SEAT / CINEBOOK MONOGRAM MODEL --- */}

            {/* A. 3D Drop Shadow on Floor */}
            <ellipse
              cx="18"
              cy="32"
              rx="11"
              ry="3"
              fill="#000000"
              fillOpacity="0.55"
              className="filter blur-[1px]"
            />

            {/* B. 3D Isometric Seat Base / Cushion Extrusion (Depth) */}
            <path
              d="M7 21 L18 27 L29 21 L29 24 L18 30 L7 24 Z"
              fill="url(#cine3dExtrude)"
              stroke="#F59E0B"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />

            {/* C. 3D Isometric Seat Cushion Top Face */}
            <path
              d="M7 21 L18 15 L29 21 L18 27 Z"
              fill="url(#cine3dGoldTop)"
              stroke="#FFFBEB"
              strokeWidth="0.6"
            />

            {/* D. 3D Recliner Backrest Extrusion */}
            <path
              d="M9 19 L18 14 L18 7 L9 12 Z"
              fill="#92400E"
            />
            <path
              d="M27 19 L18 14 L18 7 L27 12 Z"
              fill="#78350F"
            />

            {/* E. 3D Recliner Backrest Front Face */}
            <path
              d="M10 13 L18 8 L26 13 L26 19 L18 24 L10 19 Z"
              fill="url(#cine3dGoldTop)"
              stroke="#FFFBEB"
              strokeWidth="0.75"
              filter="url(#cineGlow)"
            />

            {/* F. Cinebook Cinema Film Strip Overlay on Backrest */}
            <path
              d="M12 14.5 L18 10.5 L24 14.5 L18 18.5 Z"
              fill="url(#cine3dFilm)"
              stroke="#F59E0B"
              strokeWidth="0.5"
            />

            {/* G. Cinebook "CB" / Film Camera Icon in Center of 3D Crest */}
            {/* Film sprocket dots */}
            <circle cx="14" cy="14" r="0.7" fill="#F59E0B" />
            <circle cx="16" cy="12.7" r="0.7" fill="#F59E0B" />
            <circle cx="20" cy="12.7" r="0.7" fill="#F59E0B" />
            <circle cx="22" cy="14" r="0.7" fill="#F59E0B" />
            
            {/* Center Glowing Cinebook 'C' Star Emblem */}
            <path
              d="M18 12.2 L19.2 14.5 L21.5 14.8 L19.8 16.3 L20.3 18.5 L18 17.2 L15.7 18.5 L16.2 16.3 L14.5 14.8 L16.8 14.5 Z"
              fill="#FFFBEB"
              stroke="#D97706"
              strokeWidth="0.4"
            />

            {/* H. Specular Light Glint Reflection across top edge */}
            <path
              d="M10 13 L18 8 L20 9.2 L12 14.2 Z"
              fill="url(#cine3dShimmer)"
            />

            {/* I. 3D Left Armrest */}
            <path
              d="M6 19 L10 16.5 L10 20 L6 22.5 Z"
              fill="url(#cine3dGoldTop)"
              stroke="#FFFBEB"
              strokeWidth="0.4"
            />

            {/* J. 3D Right Armrest */}
            <path
              d="M26 16.5 L30 19 L30 22.5 L26 20 Z"
              fill="url(#cine3dGoldTop)"
              stroke="#FFFBEB"
              strokeWidth="0.4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CinebookSeat3D;
