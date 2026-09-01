import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Ticket,
  MapPin,
  Clock,
  ChevronDown,
  Building,
  Star
} from 'lucide-react';
import { MOVIES, EVENTS, THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import SeatSelectionModal from '../../components/booking/SeatSelectionModal';
import TrailerModal from '../../components/movies/TrailerModal';
import Footer from '../../components/layout/Footer';

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, color: 'from-pink-500 to-rose-600', link: '/movies' },
  { label: 'IMAX 3D Laser', icon: Sparkles, color: 'from-purple-500 to-indigo-600', link: '/movies?format=IMAX' },
  { label: 'Dolby Atmos 7.1', icon: Sparkles, color: 'from-cyan-400 to-blue-600', link: '/movies?format=Dolby' },
  { label: 'Live Events', icon: Calendar, color: 'from-amber-400 to-orange-500', link: '/events' },
  { label: 'Local Theatres', icon: Building, color: 'from-emerald-400 to-teal-600', link: '/theatres' }
];

const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { theme } = useTheme();

  // Filter theatres strictly for the active selected city
  const cityTheatres = THEATRES.filter(t => t.city === selectedCity.id);
  
  // Selected theatre state (defaults to first theatre of selected city)
  const [selectedTheatreIndex, setSelectedTheatreIndex] = useState(0);
  const activeTheatre = cityTheatres[selectedTheatreIndex] || cityTheatres[0] || THEATRES[0];

  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState(MOVIES[0]);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState('11:00 AM');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  const handleOpenSeatModal = (movie, theatreName, time = '11:00 AM') => {
    setSelectedMovieForBooking(movie || MOVIES[0]);
    setSelectedSlotForBooking(time);
    setIsSeatModalOpen(true);
  };

  const handleVenueBook = ({ theatreName, time }) => {
    handleOpenSeatModal(MOVIES[0], theatreName, time);
  };

  return (
    <div className="min-h-screen transition-colors duration-400 flex flex-col justify-between overflow-x-hidden">
      <div>
        {/* 1. HERO CAROUSEL BILLBOARD */}
        <HeroCarousel onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)} />

        {/* 2. VIBRANT CATEGORY CAPSULES STRIP */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_CAPSULES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.label}
                  to={cap.link}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-panel hover:border-pink-500 transition-all group flex-shrink-0"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cap.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black tracking-wide text-theme-primary">{cap.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. MIDDLE DISCOVERY SECTION: MOVIES + THEATRE SHOWTIMES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-pink-500 uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Showing in {selectedCity.name} ({cityTheatres.length} Theatres)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-theme-primary">
                RECOMMENDED BLOCKBUSTERS
              </h2>
            </div>

            {/* City Selector Pill */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:border-pink-500 text-xs font-black transition-all shadow-md self-start sm:self-auto"
            >
              <span className="text-base">{selectedCity.icon}</span>
              <span className="uppercase text-theme-primary">LOCATION: {selectedCity.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-theme-muted" />
            </button>
          </div>

          {/* Grid: 4 Blockbuster Movies (Left 2/3) & Theatre Showtimes + Live Events (Right 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: 4 Movies Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6">
                {MOVIES.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onBookClick={(m) => handleOpenSeatModal(m, activeTheatre.name, '11:00 AM')}
                  />
                ))}
              </div>

              {/* View All Movies */}
              <div className="pt-2 text-center sm:text-left">
                <Link
                  to="/movies"
                  className="inline-flex items-center gap-2 text-xs font-black text-pink-500 hover:text-cyan-500 transition-colors"
                >
                  <span>Explore all cinema schedules in {selectedCity.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right 1 Col: Location-Specific Theatres Selector & Showtimes */}
            <div className="space-y-8">
              {/* Theatres in Selected City Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Cinemas in {selectedCity.name} ({cityTheatres.length})
                  </span>
                  <Link to="/theatres" className="text-[11px] font-bold text-cyan-500 hover:underline">
                    View All
                  </Link>
                </div>

                {/* Horizontal Quick Theatre Pill Selector for this City */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {cityTheatres.map((theatre, idx) => {
                    const isSelected = activeTheatre.id === theatre.id;
                    return (
                      <button
                        key={theatre.id}
                        onClick={() => setSelectedTheatreIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-md scale-102'
                            : 'glass-panel text-theme-secondary hover:border-pink-500'
                        }`}
                      >
                        {theatre.name}
                      </button>
                    );
                  })}
                </div>

                {/* Showtimes for the Active City Theatre */}
                <TheatreShowtimesCard
                  theatreName={activeTheatre.name}
                  address={activeTheatre.address}
                  priceRange="₹120 - ₹280"
                  timeSlots={['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM']}
                  onBookTickets={handleVenueBook}
                />
              </div>

              {/* Live Events & Shows for Selected City */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-theme-primary">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                    LIVE ENTERTAINMENT IN {selectedCity.name.toUpperCase()}
                  </h3>
                  <Link to="/events" className="text-xs font-black text-pink-500 hover:text-cyan-500">
                    See All
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-2xl glass-panel hover:border-pink-500 flex items-center gap-3.5 transition-all group"
                    >
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black text-pink-500 uppercase tracking-wider">
                          {event.category}
                        </span>
                        <h4 className="text-xs font-black truncate mt-0.5 text-theme-primary">{event.title}</h4>
                        <p className="text-[10px] text-theme-muted mt-0.5">{event.venue}</p>
                        <p className="text-xs font-black gradient-text-gold mt-1">From ₹{event.priceStarting}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SELECT SHOWTIME & INTERACTIVE SEAT MATRIX MODAL */}
      <SeatSelectionModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        movie={{
          title: selectedMovieForBooking.title,
          censor: selectedMovieForBooking.censorRating || 'UA',
          language: selectedMovieForBooking.languages?.join(' • ') || 'Telugu',
          posterUrl: selectedMovieForBooking.posterUrl
        }}
        theatreName={activeTheatre.name}
        selectedTime={selectedSlotForBooking}
      />

      {/* 5. TRAILER PREVIEW MODAL */}
      {selectedTrailerMovie && (
        <TrailerModal
          isOpen={!!selectedTrailerMovie}
          onClose={() => setSelectedTrailerMovie(null)}
          trailerUrl={selectedTrailerMovie.trailerUrl}
          movieTitle={selectedTrailerMovie.title}
        />
      )}

      {/* 6. MINIMAL 3-COLUMN FOOTER */}
      <Footer />
    </div>
  );
};

export default HomePage;
