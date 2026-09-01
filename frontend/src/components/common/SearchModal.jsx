import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { MOVIES, THEATRES, EVENTS } from '../../data/mockData';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMovies = query.trim()
    ? MOVIES.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genres.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
        m.languages.some(l => l.toLowerCase().includes(query.toLowerCase())) ||
        m.director.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredTheatres = query.trim()
    ? THEATRES.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.address.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredEvents = query.trim()
    ? EVENTS.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectMovie = (slug) => {
    onClose();
    navigate(`/movie/${slug}`);
  };

  const handleSelectTheatre = (theatreId) => {
    onClose();
    navigate(`/theatres`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-cine-surface border border-cine-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cine-border bg-cine-card/40">
          <Search className="w-5 h-5 text-cine-primary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, theatres, events, genres, languages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-cine-textMuted text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-cine-textMuted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cine-card text-cine-textMuted hover:text-white border border-cine-border"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() ? (
            <div className="py-8 text-center">
              <Film className="w-10 h-10 text-cine-textMuted/40 mx-auto mb-3" />
              <p className="text-sm text-cine-textMuted">Type a movie title, cinema name, or genre to get started</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-cine-textMuted">Quick Search:</span>
                {['Dune: Part Two', 'Oppenheimer', 'IMAX 3D', 'Sci-Fi', 'Phoenix Mall'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-full bg-cine-card text-xs text-zinc-300 hover:text-white hover:border-cine-primary border border-cine-border transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Movies Result */}
              {filteredMovies.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cine-textMuted mb-2.5 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-cine-primary" /> Movies ({filteredMovies.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredMovies.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => handleSelectMovie(movie.slug)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-cine-card/50 hover:bg-cine-card border border-transparent hover:border-cine-border cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-sm"
                          />
                          <div>
                            <h5 className="text-sm font-semibold text-white group-hover:text-cine-primary transition-colors">
                              {movie.title}
                            </h5>
                            <p className="text-xs text-cine-textMuted mt-0.5">
                              {movie.genres.join(' • ')} • {movie.languages.join(', ')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center text-xs text-cine-gold font-medium">
                                <Star className="w-3 h-3 fill-cine-gold text-cine-gold mr-1" /> {movie.rating}
                              </span>
                              <span className="text-xs text-zinc-500">|</span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-cine-border/50 text-zinc-300">
                                {movie.formats.join(' / ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cine-textMuted group-hover:text-cine-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Theatres Result */}
              {filteredTheatres.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cine-textMuted mb-2.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cine-accent" /> Cinemas & Theatres ({filteredTheatres.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredTheatres.map((theatre) => (
                      <div
                        key={theatre.id}
                        onClick={() => handleSelectTheatre(theatre.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-cine-card/50 hover:bg-cine-card border border-transparent hover:border-cine-border cursor-pointer transition-all group"
                      >
                        <div>
                          <h5 className="text-sm font-medium text-white group-hover:text-cine-accent transition-colors">
                            {theatre.name}
                          </h5>
                          <p className="text-xs text-cine-textMuted mt-0.5">
                            {theatre.address}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-cine-textMuted group-hover:text-cine-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {filteredMovies.length === 0 && filteredTheatres.length === 0 && filteredEvents.length === 0 && (
                <div className="py-8 text-center text-sm text-cine-textMuted">
                  No matching movies, theatres, or events found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
