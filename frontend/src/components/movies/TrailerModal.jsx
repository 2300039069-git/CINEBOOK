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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-cine-surface border border-cine-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cine-border bg-cine-card/50">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cine-primary" />
            <h3 className="text-base font-bold text-white truncate">
              {movieTitle} — Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cine-textMuted hover:text-white hover:bg-cine-card transition-colors"
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
            <div className="flex items-center justify-center h-full text-cine-textMuted">
              Trailer video preview is currently unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
