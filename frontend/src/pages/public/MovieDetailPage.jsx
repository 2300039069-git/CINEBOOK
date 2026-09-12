import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Play,
  Share2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles,
  Film,
  Calendar
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import ShowtimeFilter from '../../components/booking/ShowtimeFilter';
import TrailerModal from '../../components/movies/TrailerModal';

const MovieDetailPage = () => {
  const { slug } = useParams();
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();
  const { toast } = useToast();
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
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
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
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
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
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
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
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
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
      toast.info('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 transition-colors">
      {/* 1. CINEMA HERO BACKDROP WITH POSTER */}
      <section className="relative w-full min-h-[420px] lg:min-h-[460px] bg-[#090A0E] overflow-hidden border-b border-border">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090A0E] via-[#090A0E]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Poster Card */}
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group bg-surface">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Play Trailer Overlay */}
            <button
              type="button"
              onClick={() => setIsTrailerOpen(true)}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-white shadow-md">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Watch Trailer</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-3.5 text-center md:text-left text-white">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-accent text-white text-[11px] font-bold uppercase tracking-wider">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Releasing Soon'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md">
                {movie.censorRating || 'UA 16+'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white text-xs font-medium backdrop-blur-md">
                {movie.formats?.join(' • ') || '4K Laser, Dolby Atmos'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {movie.title}
            </h1>

            {/* Rating Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-extrabold text-white">{movie.rating}/10</span>
                <span className="text-slate-300 font-normal">({movie.votes || '24K'} Votes)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-200">
                <Clock className="w-4 h-4 text-slate-300" />
                <span>{movie.duration || '2h 45m'}</span>
              </div>

              <div className="text-slate-200 font-medium">
                <span>{movie.genres?.join(', ') || movie.genre}</span>
              </div>

              <div className="text-slate-300">
                <span>{movie.languages?.join(' • ') || movie.language}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const element = document.getElementById('showtimes-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-3 rounded-xl bg-gold hover:bg-gold-hover text-background text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Grab your seats in {selectedCity.name}
              </button>

              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Trailer</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-surface p-6 rounded-xl border border-border">
            <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">About the Movie</h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
              {movie.description}
            </p>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Cast & Crew Ensemble
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast?.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-elevated border border-border">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{actor.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Facts Box */}
          <div className="bg-surface p-6 rounded-xl border border-border space-y-3 h-fit text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Movie Facts
            </h3>
            <div className="space-y-2.5 text-text-secondary">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Director</span>
                <span className="font-semibold text-text-primary">{movie.director}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Release Date</span>
                <span className="font-semibold text-text-primary">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Languages</span>
                <span className="font-semibold text-text-primary">{movie.languages?.join(', ') || movie.language}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted">Certification</span>
                <span className="font-semibold text-text-primary">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRE MATRIX SECTION (CITY FILTERED) */}
      <section id="showtimes-section" className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Available Cinemas in {selectedCity.name}
            </span>
            <h3 className="text-base font-bold text-text-primary mt-0.5">
              {theatresWithShows.length} Theatres Showing in {selectedCity.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold self-start sm:self-auto cursor-pointer transition-colors"
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
