import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Play,
  Share2,
  Ticket,
  Building,
  ArrowLeft
} from 'lucide-react';
import { MOVIES, THEATRES, SAMPLE_SHOWTIMES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import ShowtimeFilter from '../../components/booking/ShowtimeFilter';
import ShowtimeDetailsModal from '../../components/booking/ShowtimeDetailsModal';
import TrailerModal from '../../components/movies/TrailerModal';

export const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();
  const { toast } = useToast();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  const movie = MOVIES.find((m) => m.slug === movieId || m.id === movieId) || MOVIES[0];

  useEffect(() => {
    setSelectedMovie(movie);
  }, [movie]);

  const theatresWithShows = React.useMemo(() => {
    return THEATRES.filter((t) => t.city === selectedCity.id).map((theatre) => ({
      ...theatre,
      shows: SAMPLE_SHOWTIMES.filter((s) => s.movieId === movie.id && s.theatreId === theatre.id)
    }));
  }, [selectedCity.id, movie.id]);

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
        text: `Book tickets for ${movie.title} in 4K Laser with Atmos on CineBook!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (typeof toast?.info === 'function') toast.info('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#171b34] text-white pb-28 select-none">
      
      {/* 1. CINEMA HERO BACKDROP WITH FLOATING POSTER */}
      <section className="relative w-full min-h-[460px] lg:min-h-[500px] bg-[#171b34] overflow-hidden border-b border-white/10 pt-20">
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171b34] via-[#171b34]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171b34] via-[#171b34]/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          
          {/* Floating Poster Card */}
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_24px_rgba(224,180,92,0.35)] border border-[#e0b45c]/40 flex-shrink-0 group bg-[#1e2348]">
            <img
              src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            {/* Play Overlay */}
            <button
              type="button"
              onClick={() => setIsTrailerOpen(true)}
              className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f6dd9c] to-[#e0b45c] flex items-center justify-center text-[#171b34] shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Play Trailer</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4 text-center md:text-left text-white">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#e0b45c]/20 border border-[#e0b45c]/40 text-[#f6dd9c] text-[10px] font-bold uppercase tracking-wider">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Releasing Soon'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1e2348] border border-white/10 text-white text-xs font-semibold">
                {movie.censorRating || 'UA 16+'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#1e2348] border border-white/10 text-[#e0b45c] text-xs font-semibold">
                {movie.formats?.join(' • ') || '4K RGB Laser • Dolby Atmos'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-display">
              {movie.title}
            </h1>

            {/* Rating Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2348] border border-[#e0b45c]/30 text-[#e0b45c] font-bold">
                <span>★</span>
                <span>{movie.rating || '4.5'}/5</span>
                <span className="text-[#a8adc9] font-normal">({movie.votes || '28K'} Votes)</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#a8adc9] font-semibold">
                <Clock className="w-4 h-4 text-[#e0b45c]" />
                <span>{movie.duration || '2h 45m'}</span>
              </div>

              <div className="text-[#a8adc9] font-medium">
                <span>{movie.genres?.join(', ') || movie.genre}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsShowtimeModalOpen(true)}
                className="luxury-gold-btn px-7 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Find Best Seats</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="px-6 py-3 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>Watch Trailer</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/15 text-[#e0b45c] transition-all cursor-pointer"
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
          <div className="lg:col-span-2 space-y-6 bg-[#1e2348] border border-white/10 p-6 sm:p-8 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
                About the Movie
              </h2>
              <p className="text-xs sm:text-sm text-[#a8adc9] leading-relaxed font-normal mt-2">
                {movie.description}
              </p>
            </div>

            {/* Cast Cards */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a8adc9] mb-3 font-display">
                Cast & Crew Ensemble
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {movie.cast?.map((actor) => (
                  <div key={actor.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#262b52] border border-white/10">
                    <img
                      src={actor.photo}
                      alt={actor.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[10px] text-[#a8adc9] truncate">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Movie Facts Box */}
          <div className="bg-[#1e2348] border border-white/10 p-6 sm:p-8 rounded-2xl space-y-4 h-fit text-xs shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white font-display">
              Movie Facts & Specs
            </h3>
            <div className="space-y-3 text-[#a8adc9]">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>Director</span>
                <span className="font-bold text-white">{movie.director}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>Release Date</span>
                <span className="font-bold text-white">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>Audio Engine</span>
                <span className="font-bold text-[#e0b45c]">Dolby Atmos 7.1</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Certification</span>
                <span className="font-bold text-white">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWTIMES & THEATRE MATRIX SECTION */}
      <section id="showtimes-section" className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1e2348] border border-white/10 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#e0b45c] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#e0b45c]" /> Available Cinemas in {selectedCity.name}
            </span>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">
              {theatresWithShows.length} Theatres Showing in {selectedCity.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#262b52] hover:bg-[#323868] border border-white/10 text-white text-xs font-bold self-start sm:self-auto cursor-pointer transition-colors shadow-xs"
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
          timeSlots={['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM']}
        />
      )}

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
};

export default MovieDetailPage;
