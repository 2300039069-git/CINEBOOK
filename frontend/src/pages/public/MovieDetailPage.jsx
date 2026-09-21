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
import ShowtimeDetailsModal from '../../components/booking/ShowtimeDetailsModal';
import TrailerModal from '../../components/movies/TrailerModal';
import { Button } from '../../components/ui/Button';

export const MovieDetailPage = () => {
  const { slug } = useParams();
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
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
        format: '4K Dolby Atmos',
        language: 'Telugu',
        time: '10:00 AM',
        price: { CLASSIC: 120, PREMIUM: 180, RECLINER: 250 },
        availability: 'AVAILABLE'
      },
      {
        id: `sh-${theatre.id}-02`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
        format: '4K Dolby Atmos',
        language: 'Telugu',
        time: '12:00 PM',
        price: { CLASSIC: 120, PREMIUM: 180, RECLINER: 250 },
        availability: 'FILLING_FAST'
      },
      {
        id: `sh-${theatre.id}-03`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
        format: '4K Dolby Atmos',
        language: 'Telugu',
        time: '04:00 PM',
        price: { CLASSIC: 130, PREMIUM: 200, RECLINER: 280 },
        availability: 'AVAILABLE'
      },
      {
        id: `sh-${theatre.id}-04`,
        movieId: movie.id,
        theatreId: theatre.id,
        theatreName: theatre.name,
        screenName: theatre.screens?.[0]?.name || 'Audi 1 4K Laser',
        format: '4K Dolby Atmos',
        language: 'Telugu',
        time: '07:30 PM',
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
      if (typeof toast?.info === 'function') toast.info('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pb-28 transition-colors">
      
      {/* 1. CINEMA HERO BACKDROP WITH FLOATING POSTER */}
      <section className="relative w-full min-h-[460px] lg:min-h-[500px] bg-[#0B0E14] overflow-hidden border-b border-[#E5A93C]/20 pt-20">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          
          {/* Floating Poster Card */}
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_0_25px_rgba(229,169,60,0.35)] border-2 border-[#E5A93C]/40 flex-shrink-0 group bg-[#121824]">
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5A93C] to-[#FFD066] flex items-center justify-center text-[#0B0E14] shadow-lg shadow-[#E5A93C]/40">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-wider">Play 4K Trailer</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4 text-center md:text-left text-white">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#FFD066] text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(229,169,60,0.3)]">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Releasing Soon'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#121824]/80 border border-[#E5A93C]/25 text-white text-xs font-bold backdrop-blur-md">
                {movie.censorRating || 'UA 16+'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#121824]/80 border border-[#E5A93C]/25 text-[#FFD066] text-xs font-bold backdrop-blur-md">
                {movie.formats?.join(' • ') || '4K RGB Laser • Dolby Atmos'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-display">
              {movie.title}
            </h1>

            {/* Rating Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121824]/90 backdrop-blur-md border border-[#E5A93C]/30 shadow-[0_0_12px_rgba(229,169,60,0.25)]">
                <Star className="w-4 h-4 fill-[#FFD066] text-[#FFD066]" />
                <span className="text-sm font-black text-[#FFD066]">⭐ {movie.rating || '9.4'}/10</span>
                <span className="text-slate-400 font-normal">({movie.votes || '28K'} Votes)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Clock className="w-4 h-4 text-[#E5A93C]" />
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
              <button
                type="button"
                onClick={() => setIsShowtimeModalOpen(true)}
                className="gold-glow-btn px-7 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Find Best Seats</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="px-6 py-3 rounded-2xl bg-[#121824]/80 hover:bg-[#1A2234] border border-[#E5A93C]/30 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#E5A93C]"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>Watch Trailer</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-2xl bg-[#121824] hover:bg-[#1A2234] border border-[#E5A93C]/30 text-[#FFD066] transition-all cursor-pointer"
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
          <div className="lg:col-span-2 space-y-6 gold-glass-card p-6 sm:p-8 rounded-3xl">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider font-display">
                About the Movie
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mt-2">
                {movie.description}
              </p>
            </div>

            {/* Cast Cards */}
            <div className="pt-4 border-t border-[#E5A93C]/20">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 font-display">
                Cast & Crew Ensemble
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast?.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1A2234] border border-[#E5A93C]/20">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5A93C]/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Movie Facts Box */}
          <div className="gold-glass-card p-6 sm:p-8 rounded-3xl space-y-4 h-fit text-xs shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-wider text-white font-display">
              Movie Facts & Specs
            </h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-[#E5A93C]/20">
                <span className="text-slate-400">Director</span>
                <span className="font-bold text-white">{movie.director}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5A93C]/20">
                <span className="text-slate-400">Release Date</span>
                <span className="font-bold text-white">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5A93C]/20">
                <span className="text-slate-400">Audio Engine</span>
                <span className="font-bold text-[#FFD066]">Dolby Atmos 7.1</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Certification</span>
                <span className="font-bold text-white">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRE MATRIX SECTION */}
      <section id="showtimes-section" className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl gold-glass-card shadow-sm">
          <div>
            <span className="text-xs font-black text-[#FFD066] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#E5A93C]" /> Available Cinemas in {selectedCity.name}
            </span>
            <h3 className="text-lg font-black text-white font-display mt-0.5">
              {theatresWithShows.length} Theatres Showing in {selectedCity.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1A2234] hover:bg-[#222C42] border border-[#E5A93C]/30 text-white text-xs font-bold self-start sm:self-auto cursor-pointer transition-colors shadow-xs"
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

      {/* Showtime Details Modal */}
      {isShowtimeModalOpen && (
        <ShowtimeDetailsModal
          isOpen={isShowtimeModalOpen}
          onClose={() => setIsShowtimeModalOpen(false)}
          movie={movie}
          theatreName="Grand Cinema Complex - Screen 5"
          theatreAddress="Main Multiplex Complex, 4K Laser Projection"
          timeSlots={['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM']}
        />
      )}

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
