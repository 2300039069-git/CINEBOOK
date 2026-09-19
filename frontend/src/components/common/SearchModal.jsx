import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, Building, Sparkles, ArrowRight, Star, Clock } from 'lucide-react';
import { MOVIES, THEATRES, GENRES } from '../../data/mockData';
import { Modal } from '../ui/Modal';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'MOVIES' | 'CINEMAS'
  const navigate = useNavigate();

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredMovies = query.trim()
    ? MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.genres?.some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
          m.director?.toLowerCase().includes(query.toLowerCase()) ||
          m.cast?.some((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      )
    : MOVIES.slice(0, 4);

  const filteredTheatres = query.trim()
    ? THEATRES.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.address.toLowerCase().includes(query.toLowerCase())
      )
    : THEATRES.slice(0, 3);

  const handleSelectMovie = (movie) => {
    onClose();
    navigate(`/movie/${movie.slug || movie.id}`);
  };

  const handleSelectTheatre = (theatre) => {
    onClose();
    navigate('/theatres');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" showClose={false}>
      <div className="space-y-5 -m-1">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-primary absolute left-4 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blockbusters, actors, genres, cinemas..."
            className="w-full pl-12 pr-10 py-3.5 bg-surface-elevated border border-border rounded-2xl text-sm font-bold text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 p-1 rounded-lg bg-surface text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {['ALL', 'MOVIES', 'CINEMAS'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-xs'
                  : 'bg-surface-elevated border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {cat === 'ALL' ? 'Everything' : cat === 'MOVIES' ? 'Movies & Shows' : 'Cinemas & Venues'}
            </button>
          ))}
        </div>

        {/* Results Stream */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Movies Section */}
          {(selectedCategory === 'ALL' || selectedCategory === 'MOVIES') && filteredMovies.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-text-muted flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-primary" />
                <span>{query.trim() ? 'Matching Movies' : 'Trending Blockbusters'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className="p-2.5 rounded-2xl bg-surface-elevated hover:bg-surface-hover border border-border hover:border-primary/50 flex items-center gap-3 cursor-pointer transition-all group"
                  >
                    <img
                      src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                      alt={movie.title}
                      className="w-12 h-16 rounded-xl object-cover shrink-0 border border-border group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                        {movie.title}
                      </h4>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">
                        {movie.genres?.join(', ') || movie.genre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{movie.rating}</span>
                        </span>
                        <span className="text-[10px] text-text-muted">• {movie.duration || '2h 45m'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cinemas Section */}
          {(selectedCategory === 'ALL' || selectedCategory === 'CINEMAS') && filteredTheatres.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[10px] uppercase font-black tracking-widest text-text-muted flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-accent" />
                <span>Cinemas & Auditoriums</span>
              </span>
              <div className="space-y-2">
                {filteredTheatres.map((theatre) => (
                  <div
                    key={theatre.id}
                    onClick={() => handleSelectTheatre(theatre)}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-hover border border-border hover:border-accent/50 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                          {theatre.name}
                        </h4>
                        <p className="text-[10px] text-text-muted">{theatre.address}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
