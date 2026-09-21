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
  Star,
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { MOVIES, EVENTS, THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import TrailerModal from '../../components/movies/TrailerModal';
import ShowtimeDetailsModal from '../../components/booking/ShowtimeDetailsModal';
import DateDayRibbon from '../../components/common/DateDayRibbon';

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, link: '/movies', tag: 'Premiere' },
  { label: '4K RGB Laser', icon: Sparkles, link: '/movies?format=4K', tag: 'Ultra-HD' },
  { label: 'Dolby Atmos 7.1', icon: Headphones, link: '/movies?format=Dolby', tag: 'Surround' },
  { label: 'Live Events', icon: Calendar, link: '/events', tag: 'Experiences' },
  { label: 'Cinemas & Venues', icon: Building, link: '/theatres', tag: 'Auditoriums' }
];

export const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, selectedDate, setSelectedDate } = useBooking();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter theatres strictly for active selected city
  const cityTheatres = THEATRES.filter((t) => t.city === selectedCity.id);
  const [selectedTheatreIndex, setSelectedTheatreIndex] = useState(0);
  const activeTheatre = cityTheatres[selectedTheatreIndex] || cityTheatres[0] || THEATRES[0];
  
  // Modals state
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [showtimeModalMovie, setShowtimeModalMovie] = useState(null);

  const handleVenueBook = ({ theatreName, time, date }) => {
    const movie = MOVIES[0];
    const chosenDate = date || selectedDate || new Date().toISOString().split('T')[0];
    setSelectedMovie(movie);
    setSelectedTheatre(activeTheatre);
    setSelectedDate(chosenDate);
    setSelectedShow({
      id: `sh-${activeTheatre.id}-01`,
      movieId: movie.id,
      theatreId: activeTheatre.id,
      theatreName: activeTheatre.name,
      time: time || '11:00 AM',
      format: '2D Dolby Atmos',
      date: chosenDate
    });
    navigate(`/seat-selection/sh-${activeTheatre.id}-01`);
  };

  const handleOpenShowtimes = (movie, time) => {
    setSelectedMovie(movie);
    setShowtimeModalMovie(movie);
  };

  const trendingMovies = MOVIES.slice(0, 3);
  const displayedMovies = searchQuery.trim()
    ? MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    : MOVIES;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pb-28 transition-colors duration-200">
      
      {/* 1. HERO CAROUSEL BILLBOARD WITH GLOWING POSTERS & STAR RATINGS */}
      <HeroCarousel
        onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)}
        onOpenShowtimes={(movie) => handleOpenShowtimes(movie)}
      />

      {/* 2. SEARCH BAR WITH FINE GOLDEN GLOWING FRAME */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="relative p-1 rounded-3xl bg-gradient-to-r from-[#E5A93C]/40 via-[#FFD066]/60 to-[#E5A93C]/40 shadow-[0_0_20px_rgba(229,169,60,0.35)]">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-3xl bg-[#121824]/95 backdrop-blur-2xl">
            <Search className="w-5 h-5 text-[#FFD066] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blockbusters, actors, Dolby Atmos auditoriums in your city..."
              className="w-full bg-transparent text-sm font-bold text-white placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2 py-1 rounded-lg bg-[#1A2234] text-xs font-bold text-[#FFD066]"
              >
                Clear
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#FFD066] border-l border-[#E5A93C]/30 pl-3 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>4K Laser Booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC DATE & DAY SELECTION RIBBON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <DateDayRibbon
          selectedDate={selectedDate}
          onDateSelect={(d) => setSelectedDate(d)}
        />
      </div>

      {/* 4. CATEGORY CAPSULES STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_CAPSULES.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.label}
                to={cap.link}
                className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121824] border border-[#E5A93C]/20 hover:border-[#E5A93C] hover:shadow-[0_0_15px_rgba(229,169,60,0.25)] transition-all duration-200 flex-shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#FFD066] group-hover:bg-[#E5A93C] group-hover:text-[#0B0E14] transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wide text-white group-hover:text-[#FFD066] transition-colors block">
                    {cap.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
                    {cap.tag}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. MAIN DISCOVERY SECTION: NOW SHOWING LISTINGS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        
        {/* SECTION HEADER: NOW SHOWING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5A93C]/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#FFD066] uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
              <span>EXPERIENCE CINEMA IN {selectedCity.name.toUpperCase()} ({cityTheatres.length} VENUES)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Now Showing in {selectedCity.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#121824] border border-[#E5A93C]/30 hover:border-[#E5A93C] text-xs font-bold text-white transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span className="text-sm">{selectedCity.icon}</span>
            <span className="uppercase tracking-wider">{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* GRID: MOVIES & THEATRE SHOWTIMES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Master Movie Grid with Showtime Pills & "Find Best Seats" */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {displayedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenShowtimes={(m) => handleOpenShowtimes(m)}
                />
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#121824] border border-[#E5A93C]/30 hover:border-[#E5A93C] text-xs font-bold text-slate-200 hover:text-[#FFD066] transition-all shadow-sm group"
              >
                <span>Explore all {MOVIES.length} blockbuster movies showing in {selectedCity.name}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#FFD066]" />
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Theatre Venue Picker & Live Events */}
          <div className="space-y-6">
            
            {/* Theatres in Selected City Card */}
            <div className="gold-glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5A93C]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E5A93C]/10 text-[#FFD066] flex items-center justify-center border border-[#E5A93C]/25">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                      Cinemas in {selectedCity.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">Grand Cinema Complex & Venues</p>
                  </div>
                </div>
                <Link to="/theatres" className="text-xs font-bold text-[#FFD066] hover:underline">
                  View All
                </Link>
              </div>

              {/* Horizontal Theatre Pill Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {cityTheatres.map((theatre, idx) => {
                  const isSelected = activeTheatre.id === theatre.id;
                  return (
                    <button
                      key={theatre.id}
                      type="button"
                      onClick={() => setSelectedTheatreIndex(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] shadow-[0_0_12px_rgba(229,169,60,0.5)] font-black'
                          : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60'
                      }`}
                    >
                      {theatre.name}
                    </button>
                  );
                })}
              </div>

              {/* Showtimes for Active Theatre */}
              <TheatreShowtimesCard
                theatreName={activeTheatre.name}
                address={activeTheatre.address}
                priceRange="₹120 - ₹280"
                amenities={activeTheatre.amenities || ['4K RGB Laser', 'Dolby Atmos', 'Plush Recliners']}
                timeSlots={['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM']}
                selectedDate={selectedDate}
                onBookTickets={handleVenueBook}
              />
            </div>

            {/* Live Events in Selected City */}
            <div className="gold-glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5A93C]/20">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white font-display">
                  <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
                  Live Events in {selectedCity.name}
                </h3>
                <Link to="/events" className="text-xs font-bold text-[#FFD066] hover:underline">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-2xl bg-[#1A2234] border border-[#E5A93C]/20 flex items-center gap-3 transition-all group hover:border-[#E5A93C]/60 hover:shadow-[0_0_12px_rgba(229,169,60,0.2)]"
                  >
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-[#FFD066] uppercase tracking-wider">
                        {event.category}
                      </span>
                      <h4 className="text-xs font-bold truncate text-white">{event.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{event.venue}</p>
                      <p className="text-xs font-black text-[#FFD066] mt-0.5">₹{event.priceStarting}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. TRENDING SPOTLIGHT (NUMBERED RANKING 01, 02, 03) */}
        <div className="space-y-6 pt-6 border-t border-[#E5A93C]/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-[#FFD066] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FFD066]" /> Box Office Velocity
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display mt-0.5">
                Trending Blockbusters
              </h2>
            </div>
            <Link to="/movies" className="text-xs font-bold text-[#FFD066] hover:underline flex items-center gap-1">
              <span>View All Ranking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingMovies.map((movie, idx) => (
              <div
                key={movie.id}
                onClick={() => {
                  setSelectedMovie(movie);
                  navigate(`/movie/${movie.slug || movie.id}`);
                }}
                className="gold-glass-card group relative flex items-center gap-4 p-4 rounded-3xl cursor-pointer overflow-hidden transition-all"
              >
                {/* Ranking Numeral Background */}
                <span className="text-4xl sm:text-5xl font-black font-display text-[#E5A93C]/20 group-hover:text-[#E5A93C]/40 transition-colors shrink-0">
                  0{idx + 1}
                </span>

                <img
                  src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                  alt={movie.title}
                  className="w-16 h-22 rounded-2xl object-cover shrink-0 border border-[#E5A93C]/30 shadow-md group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-sm font-black text-white group-hover:text-[#FFD066] transition-colors truncate">
                    {movie.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {movie.genres?.join(', ') || movie.genre}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-black text-[#FFD066] flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#FFD066] text-[#FFD066]" />
                      <span>{movie.rating}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                      98% Liked
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. ENTERPRISE CINEMA-TECH TRUST DECK */}
        <div className="pt-10 border-t border-[#E5A93C]/20 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFD066]">
              ENGINEERED FOR CINEMAS & AUDIENCES
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Enterprise Cinema-Tech Platform
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with zero-collision distributed seat locking, dual-quota box office integration, and instant automated bank credits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="gold-glass-card p-6 rounded-3xl space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#FFD066] flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Contactless E-Passes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographically signed QR admission passes generated in real time upon authorization.
              </p>
            </div>

            <div className="gold-glass-card p-6 rounded-3xl space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#FFD066] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Atomic Seat Locking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guarantees zero double bookings across multiple tabs & sessions with distributed locks.
              </p>
            </div>

            <div className="gold-glass-card p-6 rounded-3xl space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">Dual-Quota Safe</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Physical box office cash quotas are safely segregated from online inventory.
              </p>
            </div>

            <div className="gold-glass-card p-6 rounded-3xl space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white">24/7 AI Concierge</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated booking resolutions, 1-click refund triggers, and instant gate verification assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. SCREEN 2: SHOWTIME DETAILS MODAL */}
      {showtimeModalMovie && (
        <ShowtimeDetailsModal
          isOpen={!!showtimeModalMovie}
          onClose={() => setShowtimeModalMovie(null)}
          movie={showtimeModalMovie}
          theatreName="Grand Cinema Complex - Screen 5"
          theatreAddress="Main Multiplex Complex, 4K Laser Projection"
          timeSlots={['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM']}
        />
      )}

      {/* 9. TRAILER MODAL */}
      {selectedTrailerMovie && (
        <TrailerModal
          isOpen={!!selectedTrailerMovie}
          onClose={() => setSelectedTrailerMovie(null)}
          trailerUrl={selectedTrailerMovie.trailerUrl}
          movieTitle={selectedTrailerMovie.title}
        />
      )}
    </div>
  );
};

export default HomePage;
