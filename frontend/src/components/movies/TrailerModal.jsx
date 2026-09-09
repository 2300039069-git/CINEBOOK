import React from 'react';
import { X, Film } from 'lucide-react';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  if (!isOpen) return null;

  // Extract YouTube embed ID if youtube URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#11141D] border border-[#1E2332] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1E2332] bg-[#090A0E]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#E50914]" />
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {movieTitle} — Official Trailer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181C28] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Trailer video preview is currently unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
