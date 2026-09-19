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

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, link: '/movies', tag: 'Premiere' },
  { label: '4K RGB Laser', icon: Sparkles, link: '/movies?format=4K', tag: 'High-Res' },
  { label: 'Dolby Atmos 7.1', icon: Headphones, link: '/movies?format=Dolby', tag: 'Surround' },
  { label: 'Live Events', icon: Calendar, link: '/events', tag: 'Concerts' },
  { label: 'Cinemas & Venues', icon: Building, link: '/theatres', tag: 'Auditoriums' }
];

const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, selectedDate, setSelectedDate } = useBooking();
  const navigate = useNavigate();

  // Filter theatres strictly for the active selected city
  const cityTheatres = THEATRES.filter((t) => t.city === selectedCity.id);

  // Selected theatre state (defaults to first theatre of selected city)
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

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 transition-colors duration-200">
      {/* 1. HERO CAROUSEL BILLBOARD */}
      <HeroCarousel onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)} />

      {/* 2. DYNAMIC DATES & DAYS SCHEDULING RIBBON */}
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
                className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wide text-text-primary group-hover:text-primary transition-colors block">
                    {cap.label}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium block leading-none">
                    {cap.tag}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN DISCOVERY: MOVIES + THEATRE SHOWTIMES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>EXPERIENCE CINEMA IN {selectedCity.name.toUpperCase()} ({cityTheatres.length} AUDITORIUMS)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
              Recommended Blockbusters
            </h2>
          </div>

          {/* Interactive City Selector Button */}
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface border border-border hover:border-primary/50 text-xs font-bold text-text-primary transition-all shadow-sm hover:shadow self-start sm:self-auto cursor-pointer"
          >
            <span className="text-sm">{selectedCity.icon}</span>
            <span className="uppercase tracking-wider">{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Grid: Movies (Left 2/3) & Theatre Showtimes + Live Events (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Movie Cards Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {MOVIES.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* View All Movies Link */}
            <div className="pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-bold text-text-primary hover:text-primary transition-all shadow-sm group"
              >
                <span>Explore all blockbusters showing in {selectedCity.name}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Theatre Venue Selector & Live Showtimes */}
          <div className="space-y-6">
            {/* Theatres in Selected City Card */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-primary border-primary text-white shadow-sm'
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
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 text-text-primary">
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
                    className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center gap-3 transition-all group hover:border-primary/40"
                  >
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
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

        {/* 5. COMMERCIAL GRADE TRUST BAR */}
        <div className="pt-10 border-t border-border space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              ENGINEERED FOR CINEMAS & AUDIENCES
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Enterprise Cinema-Tech Platform
            </h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Built with zero-collision distributed seat locking, dual-quota box office integration, and instant automated bank credits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Contactless E-Passes</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Cryptographically signed QR admission passes generated in real time upon authorization.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Atomic Seat Locking</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Guarantees zero double bookings across multiple tabs & sessions with distributed locks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Dual-Quota Safe</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Physical box office cash quotas are safely segregated from online inventory.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">24/7 AI Concierge</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Automated booking resolutions, 1-click refund triggers, and instant gate verification assistance.
              </p>
            </div>
          </div>

          {/* 6. THEATRE PARTNER CALLOUT BANNER */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-surface to-surface-elevated text-text-primary border border-border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 inline-block">
                FOR CINEMA OPERATORS & EXHIBITORS
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                Modernize Your Single-Screen or Multiplex with CINEBOOK
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Get full access to thermal 80mm POS slip printing, gatekeeper barcode validation scanner, real-time settlement tracking, and dual-quota seat control.
              </p>
            </div>

            <Link
              to="/partner/register"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>Partner Portal Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7. TRAILER PREVIEW MODAL */}
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

