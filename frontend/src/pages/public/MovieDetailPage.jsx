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
  Calendar,
  Ticket
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import ShowtimeFilter from '../../components/booking/ShowtimeFilter';
import TrailerModal from '../../components/movies/TrailerModal';
import { Button } from '../../components/ui/Button';

export const MovieDetailPage = () => {
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

  // Map showtimes for city theatres
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
        title: `${movie.title} on CINEBOOK`,
        text: `Book tickets for ${movie.title} in ${selectedCity.name} on CINEBOOK!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-28 transition-colors">
      
      {/* 1. CINEMA HERO BACKDROP WITH FLOATING POSTER */}
      <section className="relative w-full min-h-[460px] lg:min-h-[500px] bg-[#05070B] overflow-hidden border-b border-border pt-20">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          
          {/* Floating Poster Card */}
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group bg-surface">
            <img
              src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
              alt={movie.title}
              onError={(e) => {
                const t = ((movie.title || '') + ' ' + (movie.slug || '')).toLowerCase();
                let fb = '/posters/pushpa2.jpg';
                if (t.includes('devara')) fb = '/posters/devara.jpg';
                else if (t.includes('kalki')) fb = '/posters/kalki.webp';
                else if (t.includes('og') || t.includes('ojas')) fb = '/posters/og.jpg';
                if (e.target.src !== fb && !e.target.src.endsWith(fb)) {
                  e.target.src = fb;
                }
              }}
              className="w-full h-full object-cover"
            />
            {/* Play Overlay */}
            <button
              type="button"
              onClick={() => setIsTrailerOpen(true)}
              className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-wider">Play 4K Trailer</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4 text-center md:text-left text-white">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Releasing Soon'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
                {movie.censorRating || 'UA 16+'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur-md">
                {movie.formats?.join(' • ') || '4K RGB Laser • Dolby Atmos'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-display">
              {movie.title}
            </h1>

            {/* Rating Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-amber-400">{movie.rating}/10</span>
                <span className="text-slate-300 font-normal">({movie.votes || '28K'} Votes)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                <span>{movie.duration || '2h 45m'}</span>
              </div>

              <div className="text-slate-200 font-semibold">
                <span>{movie.genres?.join(', ') || movie.genre}</span>
              </div>

              <div className="text-slate-300">
                <span>{movie.languages?.join(' • ') || movie.language}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('showtimes-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                leftIcon={<Ticket className="w-4 h-4" />}
              >
                Grab Seats in {selectedCity.name}
              </Button>

              <Button
                variant="glass"
                size="lg"
                onClick={() => setIsTrailerOpen(true)}
                leftIcon={<Play className="w-4 h-4 fill-current ml-0.5" />}
              >
                Watch Trailer
              </Button>

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

      {/* 2. SYNOPSIS & CAST ENSEMBLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            <div>
              <h2 className="text-base font-black text-text-primary uppercase tracking-wider font-display">
                About the Movie
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal mt-2">
                {movie.description}
              </p>
            </div>

            {/* Cast Cards */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-3">
                Cast & Crew Ensemble
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast?.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-elevated border border-border">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
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

          {/* Movie Facts Box */}
          <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-4 h-fit text-xs shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-wider text-text-primary font-display">
              Movie Facts & Specs
            </h3>
            <div className="space-y-3 text-text-secondary">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Director</span>
                <span className="font-bold text-text-primary">{movie.director}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Release Date</span>
                <span className="font-bold text-text-primary">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Audio Engine</span>
                <span className="font-bold text-accent">Dolby Atmos 7.1</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted">Certification</span>
                <span className="font-bold text-text-primary">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRE MATRIX SECTION */}
      <section id="showtimes-section" className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-border shadow-sm">
          <div>
            <span className="text-xs font-black text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4" /> Available Cinemas in {selectedCity.name}
            </span>
            <h3 className="text-lg font-black text-text-primary font-display mt-0.5">
              {theatresWithShows.length} Theatres Showing in {selectedCity.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text-primary text-xs font-bold self-start sm:self-auto cursor-pointer transition-colors shadow-xs"
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
