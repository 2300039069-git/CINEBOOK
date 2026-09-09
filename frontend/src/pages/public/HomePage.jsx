import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import TrailerModal from '../../components/movies/TrailerModal';
import Footer from '../../components/layout/Footer';

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, color: 'from-[#E50914] to-[#B80710]', link: '/movies' },
  { label: 'IMAX 3D Laser', icon: Sparkles, color: 'from-[#D4AF37] to-[#E2B714]', link: '/movies?format=IMAX' },
  { label: 'Dolby Atmos 7.1', icon: Sparkles, color: 'from-[#D4AF37] to-[#B38728]', link: '/movies?format=Dolby' },
  { label: 'Live Events', icon: Calendar, color: 'from-[#E50914] to-[#990000]', link: '/events' },
  { label: 'Local Theatres', icon: Building, color: 'from-[#D4AF37] to-[#AA771C]', link: '/theatres' }
];

const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { theme } = useTheme();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow } = useBooking();
  const navigate = useNavigate();

  // Filter theatres strictly for the active selected city
  const cityTheatres = THEATRES.filter(t => t.city === selectedCity.id);
  
  // Selected theatre state (defaults to first theatre of selected city)
  const [selectedTheatreIndex, setSelectedTheatreIndex] = useState(0);
  const activeTheatre = cityTheatres[selectedTheatreIndex] || cityTheatres[0] || THEATRES[0];
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

  const handleVenueBook = ({ theatreName, time }) => {
    const movie = MOVIES[0];
    setSelectedMovie(movie);
    setSelectedTheatre(activeTheatre);
    setSelectedShow({
      id: `sh-${activeTheatre.id}-01`,
      movieId: movie.id,
      theatreId: activeTheatre.id,
      theatreName: activeTheatre.name,
      time: time || '11:00 AM',
      format: '2D Dolby Atmos'
    });
    navigate(`/seat-selection/sh-${activeTheatre.id}-01`);
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F8FAFC] transition-colors duration-400 flex flex-col justify-between overflow-x-hidden">
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
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] hover:border-[#D4AF37] transition-all group flex-shrink-0"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cap.color} flex items-center justify-center text-black shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black tracking-wide text-white">{cap.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. MIDDLE DISCOVERY SECTION: MOVIES + THEATRE SHOWTIMES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Showing in {selectedCity.name} ({cityTheatres.length} Theatres)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-white">
                RECOMMENDED BLOCKBUSTERS
              </h2>
            </div>

            {/* City Selector Pill */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1523] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-black transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <span className="text-base">{selectedCity.icon}</span>
              <span className="uppercase text-white">LOCATION: {selectedCity.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
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
                  />
                ))}
              </div>

              {/* View All Movies */}
              <div className="pt-2 text-center sm:text-left">
                <Link
                  to="/movies"
                  className="inline-flex items-center gap-2 text-xs font-black text-[#D4AF37] hover:text-[#F3E5AB] transition-colors"
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
                  <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#D4AF37]" /> Cinemas in {selectedCity.name} ({cityTheatres.length})
                  </span>
                  <Link to="/theatres" className="text-[11px] font-bold text-[#F3E5AB] hover:underline">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] border-[#D4AF37] text-black font-black shadow-md scale-102'
                            : 'bg-[#0F1523] border-[#1E293B] text-slate-300 hover:border-[#D4AF37]'
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
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                    LIVE ENTERTAINMENT IN {selectedCity.name.toUpperCase()}
                  </h3>
                  <Link to="/events" className="text-xs font-black text-[#D4AF37] hover:text-[#F3E5AB]">
                    See All
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] hover:border-[#D4AF37]/40 flex items-center gap-3.5 transition-all group shadow-md"
                    >
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black text-[#E50914] uppercase tracking-wider">
                          {event.category}
                        </span>
                        <h4 className="text-xs font-black truncate mt-0.5 text-white">{event.title}</h4>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">{event.venue}</p>
                        <p className="text-xs font-black text-[#D4AF37] mt-1">From ₹{event.priceStarting}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TRAILER PREVIEW MODAL */}
      {selectedTrailerMovie && (
        <TrailerModal
          isOpen={!!selectedTrailerMovie}
          onClose={() => setSelectedTrailerMovie(null)}
          trailerUrl={selectedTrailerMovie.trailerUrl}
          movieTitle={selectedTrailerMovie.title}
        />
      )}

      {/* 5. MINIMAL 3-COLUMN FOOTER */}
      <Footer />
    </div>
  );
};

export default HomePage;

