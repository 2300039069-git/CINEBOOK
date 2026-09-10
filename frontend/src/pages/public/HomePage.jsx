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
  Layers,
  Tv
} from 'lucide-react';
import { MOVIES, EVENTS, THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import TrailerModal from '../../components/movies/TrailerModal';
import GlassCard from '../../components/common/GlassCard';
import GradientButton from '../../components/common/GradientButton';
import AmbientGlow from '../../components/common/AmbientGlow';

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, link: '/movies', tag: 'Premiere' },
  { label: '4K RGB Laser', icon: Sparkles, link: '/movies?format=4K', tag: 'High-Res' },
  { label: 'Dolby Atmos 7.1', icon: Headphones, link: '/movies?format=Dolby', tag: 'Surround' },
  { label: 'Live Events', icon: Calendar, link: '/events', tag: 'Concerts' },
  { label: 'Cinemas & Venues', icon: Building, link: '/theatres', tag: 'Partner Audis' }
];

const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow } = useBooking();
  const navigate = useNavigate();

  // Filter theatres strictly for the active selected city
  const cityTheatres = THEATRES.filter((t) => t.city === selectedCity.id);

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
    <div className="min-h-screen bg-background text-text-primary pb-20 relative overflow-hidden transition-colors">
      {/* Background Cinematic Mesh Glows */}
      <AmbientGlow variant="crimson" intensity="subtle" className="top-80 -left-40 w-96 h-96" />
      <AmbientGlow variant="gold" intensity="subtle" className="top-[700px] -right-40 w-[500px] h-[500px]" />

      {/* 1. 3D HERO CAROUSEL BILLBOARD */}
      <HeroCarousel onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)} />

      {/* 2. 3D CATEGORY CAPSULES STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORY_CAPSULES.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.label}
                to={cap.link}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface/80 dark:bg-surface-elevated/70 border border-border/80 hover:border-gold/50 transition-all duration-300 flex-shrink-0 shadow-card hover:shadow-card-hover backdrop-blur-xl transform hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-gold/10 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-105 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wide text-text-primary group-hover:text-gold transition-colors block">
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

      {/* 3. MAIN DISCOVERY: 3D MOVIES + THEATRE SHOWTIMES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-gold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>EXPERIENCE CINEMA IN {selectedCity.name.toUpperCase()} ({cityTheatres.length} AUDITORIUMS)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text-primary">
              Recommended Blockbusters
            </h2>
          </div>

          {/* Interactive City Selector Button */}
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface/90 dark:bg-surface-elevated/90 border border-border/80 hover:border-gold/50 text-xs font-bold text-text-primary transition-all shadow-card hover:shadow-card-hover self-start sm:self-auto cursor-pointer backdrop-blur-md active:scale-95"
          >
            <span className="text-sm">{selectedCity.icon}</span>
            <span className="uppercase text-text-primary tracking-wider">{selectedCity.name}</span>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Grid: 4 Blockbuster Movies (Left 2/3) & Theatre Showtimes + Live Events (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: 4 3D Movie Cards Grid */}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface/80 dark:bg-surface-elevated/80 border border-border hover:border-gold text-xs font-bold text-gold hover:text-amber-400 transition-all shadow-sm group"
              >
                <span>Explore all blockbusters showing in {selectedCity.name}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Theatre Venue Selector & Live Showtimes */}
          <div className="space-y-6">
            {/* Theatres in Selected City Card */}
            <GlassCard variant="default" className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                      Cinemas in {selectedCity.name}
                    </h3>
                    <p className="text-[11px] text-text-muted">Real-time box office schedules</p>
                  </div>
                </div>
                <Link to="/theatres" className="text-xs font-bold text-gold hover:text-amber-400">
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
                          ? 'bg-gradient-to-r from-primary to-red-700 border-white/20 text-white shadow-cta'
                          : 'bg-surface-elevated border-border text-text-secondary hover:border-text-muted'
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
                onBookTickets={handleVenueBook}
              />
            </GlassCard>

            {/* Live Events in Selected City */}
            <GlassCard variant="default" className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Events in {selectedCity.name}
                </h3>
                <Link to="/events" className="text-xs font-bold text-gold hover:text-amber-400">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-surface-elevated/70 border border-border hover:border-border-hover flex items-center gap-3 transition-all group shadow-sm"
                  >
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider">
                        {event.category}
                      </span>
                      <h4 className="text-xs font-bold truncate text-text-primary">{event.title}</h4>
                      <p className="text-[11px] text-text-muted truncate">{event.venue}</p>
                      <p className="text-xs font-black text-text-primary mt-0.5">₹{event.priceStarting}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* 4. THEATRE-OWNER COMMERCIAL GRADE TRUST BAR */}
        <div className="pt-10 border-t border-border/80 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
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
            <GlassCard variant="default" className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Contactless E-Passes</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Cryptographically signed QR admission passes generated in real time upon Razorpay authorization.
              </p>
            </GlassCard>

            <GlassCard variant="default" className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Atomic Seat Locking</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Guarantees zero double bookings across multiple tabs & sessions with distributed memory locks.
              </p>
            </GlassCard>

            <GlassCard variant="default" className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Dual-Quota Safe</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Physical box office cash quotas are safely segregated from online inventory for single-screen exhibitors.
              </p>
            </GlassCard>

            <GlassCard variant="default" className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">24/7 AI Concierge</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Automated booking resolutions, 1-click refund triggers, and instant gate verification assistance.
              </p>
            </GlassCard>
          </div>

          {/* 5. THEATRE PARTNER CALLOUT BANNER */}
          <GlassCard
            variant="gold"
            className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-1 rounded-md border border-gold/30 inline-block">
                FOR CINEMA OPERATORS & EXHIBITORS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Modernize Your Single-Screen or Multiplex with CINEBOOK
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Get full access to thermal 80mm POS slip printing, gatekeeper barcode validation scanner, real-time settlement tracking, and dual-quota seat control.
              </p>
            </div>

            <Link to="/partner/auth" className="flex-shrink-0">
              <GradientButton variant="gold" size="md" icon={ArrowRight}>
                Partner Portal Demo
              </GradientButton>
            </Link>
          </GlassCard>
        </div>
      </div>

      {/* 6. TRAILER PREVIEW MODAL */}
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
