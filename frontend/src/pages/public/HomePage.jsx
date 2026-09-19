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
  Layers
} from 'lucide-react';
import { MOVIES, EVENTS, THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import TrailerModal from '../../components/movies/TrailerModal';
import DateDayRibbon from '../../components/common/DateDayRibbon';
import { Button } from '../../components/ui/Button';

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

  // Filter theatres strictly for active selected city
  const cityTheatres = THEATRES.filter((t) => t.city === selectedCity.id);
  const [selectedTheatreIndex, setSelectedTheatreIndex] = useState(0);
  const activeTheatre = cityTheatres[selectedTheatreIndex] || cityTheatres[0] || THEATRES[0];
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);

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

  const trendingMovies = MOVIES.slice(0, 3);
  const comingSoonMovies = MOVIES.filter(m => m.status === 'UPCOMING').concat(MOVIES.slice(2, 4));

  return (
    <div className="min-h-screen bg-background text-text-primary pb-28 transition-colors duration-200">
      
      {/* 1. HERO CAROUSEL BILLBOARD */}
      <HeroCarousel onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)} />

      {/* 2. DYNAMIC DATE & DAY SELECTION RIBBON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <DateDayRibbon
          selectedDate={selectedDate}
          onDateSelect={(d) => setSelectedDate(d)}
        />
      </div>

      {/* 3. CATEGORY CAPSULES STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_CAPSULES.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.label}
                to={cap.link}
                className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wide text-text-primary group-hover:text-primary transition-colors block">
                    {cap.label}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium block leading-none mt-0.5">
                    {cap.tag}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN DISCOVERY SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        
        {/* SECTION HEADER: NOW SHOWING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>EXPERIENCE CINEMA IN {selectedCity.name.toUpperCase()} ({cityTheatres.length} VENUES)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary font-display">
              Now Showing in {selectedCity.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 text-xs font-bold text-text-primary transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span className="text-sm">{selectedCity.icon}</span>
            <span className="uppercase tracking-wider">{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* GRID: MOVIES & THEATRE SHOWTIMES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Master Movie Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {MOVIES.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface border border-border hover:border-primary text-xs font-bold text-text-primary hover:text-primary transition-all shadow-sm group"
              >
                <span>Explore all {MOVIES.length} blockbuster movies showing in {selectedCity.name}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Theatre Venue Picker & Live Events */}
          <div className="space-y-6">
            
            {/* Theatres in Selected City Card */}
            <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
                      Cinemas in {selectedCity.name}
                    </h3>
                    <p className="text-[11px] text-text-muted">Real-time box office schedules</p>
                  </div>
                </div>
                <Link to="/theatres" className="text-xs font-bold text-primary hover:underline">
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
                          ? 'bg-primary border-primary text-white shadow-sm font-black'
                          : 'bg-surface-elevated border-border text-text-secondary hover:border-primary/50'
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
                timeSlots={['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM']}
                selectedDate={selectedDate}
                onBookTickets={handleVenueBook}
              />
            </div>

            {/* Live Events in Selected City */}
            <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Events in {selectedCity.name}
                </h3>
                <Link to="/events" className="text-xs font-bold text-primary hover:underline">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-2xl bg-surface-elevated border border-border flex items-center gap-3 transition-all group hover:border-primary/40"
                  >
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                        {event.category}
                      </span>
                      <h4 className="text-xs font-bold truncate text-text-primary">{event.title}</h4>
                      <p className="text-[11px] text-text-muted truncate">{event.venue}</p>
                      <p className="text-xs font-black text-text-primary mt-0.5">₹{event.priceStarting}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. TRENDING SPOTLIGHT (NUMBERED RANKING 01, 02, 03) */}
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-accent uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" /> Box Office Velocity
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary font-display mt-0.5">
                Trending Blockbusters
              </h2>
            </div>
            <Link to="/movies" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
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
                className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                {/* Ranking Numeral Background */}
                <span className="text-4xl sm:text-5xl font-black font-display text-text-muted/20 group-hover:text-primary/30 transition-colors shrink-0">
                  0{idx + 1}
                </span>

                <img
                  src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
                  alt={movie.title}
                  className="w-16 h-22 rounded-2xl object-cover shrink-0 border border-border shadow-md group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors truncate">
                    {movie.title}
                  </h3>
                  <p className="text-[11px] text-text-muted truncate">
                    {movie.genres?.join(', ') || movie.genre}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{movie.rating}</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      98% Liked
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. ENTERPRISE CINEMA-TECH TRUST DECK */}
        <div className="pt-10 border-t border-border space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              ENGINEERED FOR CINEMAS & AUDIENCES
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-display">
              Enterprise Cinema-Tech Platform
            </h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Built with zero-collision distributed seat locking, dual-quota box office integration, and instant automated bank credits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-text-primary">Contactless E-Passes</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Cryptographically signed QR admission passes generated in real time upon authorization.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/20 text-accent flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-text-primary">Atomic Seat Locking</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Guarantees zero double bookings across multiple tabs & sessions with distributed locks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-text-primary">Dual-Quota Safe</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Physical box office cash quotas are safely segregated from online inventory.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-text-primary">24/7 AI Concierge</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Automated booking resolutions, 1-click refund triggers, and instant gate verification assistance.
              </p>
            </div>
          </div>

          {/* EXHIBITOR PARTNER CALLOUT BANNER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface to-surface-elevated text-text-primary border border-border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/30 inline-block">
                FOR CINEMA OPERATORS & EXHIBITORS
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary font-display">
                Modernize Your Single-Screen or Multiplex with CINEBOOK
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Get full access to thermal 80mm POS slip printing, gatekeeper barcode validation scanner, real-time settlement tracking, and dual-quota seat control.
              </p>
            </div>

            <Link
              to="/partner/register"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>Partner Portal Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7. TRAILER MODAL */}
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
