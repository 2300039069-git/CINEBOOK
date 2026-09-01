import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Play,
  Share2,
  Clock,
  Heart,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import ShowtimeFilter from '../../components/booking/ShowtimeFilter';
import TrailerModal from '../../components/movies/TrailerModal';

const MovieDetailPage = () => {
  const { slug } = useParams();
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();
  const navigate = useNavigate();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const movie = MOVIES.find((m) => m.slug === slug || m.id === slug) || MOVIES[0];

  // Strictly filter theatres belonging to the selected city only!
  const cityTheatres = THEATRES.filter((t) => t.city === selectedCity.id);

  // Map showtimes for these city theatres
  const theatresWithShows = cityTheatres.map((theatre) => {
    const existingShows = SAMPLE_SHOWTIMES.filter((s) => s.theatreId === theatre.id);
    const shows = existingShows.length > 0 ? existingShows : [
      {
        id: `sh-${theatre.id}-01`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K',
        format: '2D Dolby Atmos',
        language: 'Telugu',
        time: '11:00 AM',
        price: { CLASSIC: 120, PREMIUM: 180, RECLINER: 250 },
        availability: 'AVAILABLE'
      },
      {
        id: `sh-${theatre.id}-02`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K',
        format: '2D Dolby Atmos',
        language: 'Telugu',
        time: '02:30 PM',
        price: { CLASSIC: 120, PREMIUM: 180, RECLINER: 250 },
        availability: 'FILLING_FAST'
      },
      {
        id: `sh-${theatre.id}-03`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K',
        format: '2D Dolby Atmos',
        language: 'Telugu',
        time: '06:15 PM',
        price: { CLASSIC: 130, PREMIUM: 200, RECLINER: 280 },
        availability: 'AVAILABLE'
      },
      {
        id: `sh-${theatre.id}-04`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K',
        format: '2D',
        language: 'Telugu',
        time: '09:45 PM',
        price: { CLASSIC: 110, PREMIUM: 160, RECLINER: 220 },
        availability: 'AVAILABLE'
      }
    ];

    return {
      ...theatre,
      shows
    };
  });

  const handleShowSelect = (theatre, show) => {
    setSelectedMovie(movie);
    setSelectedTheatre(theatre);
    setSelectedShow(show);
    setSelectedDate(selectedDateStr);
    navigate(`/seat-selection/${show.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${movie.title} on CineBook`,
        text: `Book tickets for ${movie.title} in ${selectedCity.name} on CineBook!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen pb-24 transition-colors">
      {/* 1. CINEMA HERO BACKDROP WITH POSTER */}
      <section className="relative w-full min-h-[440px] lg:min-h-[480px] bg-black overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Poster Card */}
          <div className="relative w-44 sm:w-56 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 group bg-black">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Play Trailer Overlay */}
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-wider">Watch Trailer</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-3.5 text-center md:text-left text-white">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-black uppercase shadow-md">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Releasing Soon'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                {movie.censorRating || 'UA'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-md">
                {movie.formats?.join(' • ')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight">
              {movie.title}
            </h1>

            {/* Rating Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-black text-white">{movie.rating}/10</span>
                <span className="text-slate-400">({movie.votes} Votes)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{movie.duration}</span>
              </div>

              <div className="text-slate-300 font-medium">
                <span>{movie.genres?.join(', ')}</span>
              </div>

              <div className="text-slate-400">
                <span>{movie.languages?.join(' • ')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('showtimes-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-all"
              >
                Book Tickets in {selectedCity.name}
              </button>

              <button
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Trailer</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
                title="Share Movie"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYNOPSIS & CAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 glass-panel p-6 rounded-3xl">
            <h2 className="text-lg font-black text-theme-primary">About the Movie</h2>
            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
              {movie.description}
            </p>

            <div className="pt-4 border-t border-[var(--theme-border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-theme-muted mb-3">
                Cast & Star Ensemble
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast?.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-2.5 p-2 rounded-2xl glass-card">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--theme-border)]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-theme-primary truncate">{actor.name}</p>
                      <p className="text-[10px] text-theme-muted truncate">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="glass-panel p-6 rounded-3xl space-y-3 h-fit text-xs">
            <h3 className="font-black text-xs uppercase tracking-wider text-pink-500">
              Movie Facts
            </h3>
            <div className="space-y-2.5 text-theme-secondary">
              <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                <span className="text-theme-muted">Director</span>
                <span className="font-bold text-theme-primary">{movie.director}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                <span className="text-theme-muted">Release Date</span>
                <span className="font-bold text-theme-primary">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                <span className="text-theme-muted">Languages</span>
                <span className="font-bold text-theme-primary">{movie.languages?.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-theme-muted">Certification</span>
                <span className="font-bold text-theme-primary">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRE MATRIX SECTION (CITY FILTERED) */}
      <section id="showtimes-section" className="pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
          <div>
            <span className="text-xs font-black text-pink-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Available Cinemas in {selectedCity.name}
            </span>
            <h3 className="text-lg font-black text-theme-primary mt-0.5">
              {theatresWithShows.length} Theatres Showing in {selectedCity.name}
            </h3>
          </div>
          <button
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-sm self-start sm:self-auto"
          >
            Change City ({selectedCity.name})
          </button>
        </div>

        <ShowtimeFilter
          theatres={theatresWithShows}
          selectedDate={selectedDateStr}
          onDateChange={(date) => setSelectedDateStr(date)}
          onShowSelect={handleShowSelect}
        />
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetailPage;
