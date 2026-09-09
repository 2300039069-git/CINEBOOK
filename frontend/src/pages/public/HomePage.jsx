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
  Headphones
} from 'lucide-react';
import { MOVIES, EVENTS, THEATRES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import HeroCarousel from '../../components/movies/HeroCarousel';
import MovieCard from '../../components/movies/MovieCard';
import TheatreShowtimesCard from '../../components/theatres/TheatreShowtimesCard';
import TrailerModal from '../../components/movies/TrailerModal';

const CATEGORY_CAPSULES = [
  { label: 'All Movies', icon: Film, link: '/movies' },
  { label: '4K RGB Laser', icon: Sparkles, link: '/movies?format=4K' },
  { label: 'Dolby Atmos 7.1', icon: Sparkles, link: '/movies?format=Dolby' },
  { label: 'Live Events', icon: Calendar, link: '/events' },
  { label: 'Cinemas & Venues', icon: Building, link: '/theatres' }
];

const HomePage = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
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
    <div className="min-h-screen bg-background text-text-primary pb-16">
      {/* 1. HERO CAROUSEL BILLBOARD */}
      <HeroCarousel onWatchTrailer={(movie) => setSelectedTrailerMovie(movie)} />

      {/* 2. CATEGORY CAPSULES STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_CAPSULES.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.label}
                to={cap.link}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-text-muted transition-all flex-shrink-0 group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-surface-elevated flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-text-primary group-hover:text-primary transition-colors">{cap.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN DISCOVERY: MOVIES + THEATRE SHOWTIMES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Showing in {selectedCity.name} ({cityTheatres.length} Theatres)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Recommended Blockbusters
            </h2>
          </div>

          {/* City Selector Pill */}
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-text-muted text-xs font-bold text-text-primary transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <span>{selectedCity.icon}</span>
            <span className="uppercase text-text-primary">{selectedCity.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
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

            {/* View All Movies Link */}
            <div className="pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-amber-400 transition-colors"
              >
                <span>Explore all movies in {selectedCity.name}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right 1 Col: Location-Specific Theatres Selector & Showtimes */}
          <div className="space-y-6">
            {/* Theatres in Selected City Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" /> Cinemas in {selectedCity.name}
                </span>
                <Link to="/theatres" className="text-xs font-semibold text-text-muted hover:text-text-primary">
                  View All
                </Link>
              </div>

              {/* Horizontal Quick Theatre Pill Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {cityTheatres.map((theatre, idx) => {
                  const isSelected = activeTheatre.id === theatre.id;
                  return (
                    <button
                      key={theatre.id}
                      type="button"
                      onClick={() => setSelectedTheatreIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-primary border-primary text-white shadow-sm'
                          : 'bg-surface border-border text-text-secondary hover:border-text-muted'
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
                amenities={activeTheatre.amenities || ['4K RGB Laser', 'Dolby Atmos', 'Recliners']}
                timeSlots={['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM']}
                onBookTickets={handleVenueBook}
              />
            </div>

            {/* Live Events in selected city */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Live Events in {selectedCity.name}
                </h3>
                <Link to="/events" className="text-xs font-semibold text-text-muted hover:text-text-primary">
                  See All
                </Link>
              </div>

              <div className="space-y-3">
                {EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-surface border border-border hover:border-text-muted flex items-center gap-3 transition-all group shadow-sm"
                  >
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                        {event.category}
                      </span>
                      <h4 className="text-xs font-bold truncate text-text-primary">{event.title}</h4>
                      <p className="text-[11px] text-text-muted truncate">{event.venue}</p>
                      <p className="text-xs font-extrabold text-text-primary mt-0.5">₹{event.priceStarting}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. WHY CINEBOOK TRUST SECTION */}
        <div className="pt-8 border-t border-border">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">The Modern Cinema Experience</h3>
            <p className="text-xs sm:text-sm text-text-muted">Engineered for seamless bookings, atomic seat concurrency, and high-fidelity sound.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Instant E-Passes</h4>
              <p className="text-xs text-text-muted leading-relaxed">Download contactless QR passes directly to your device with real-time seat validation.</p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Atomic Seat Lock</h4>
              <p className="text-xs text-text-muted leading-relaxed">Guarantees zero double bookings with high-speed Redis distributed locks and 8-minute timers.</p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Verified Audis</h4>
              <p className="text-xs text-text-muted leading-relaxed">Direct synchronization with single-screen box office counters and Barco 4K Laser projection.</p>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-border space-y-2.5 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">24/7 AI Concierge</h4>
              <p className="text-xs text-text-muted leading-relaxed">Automated booking resolutions, schedule adjustments, and instant ticket retrievals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TRAILER PREVIEW MODAL */}
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
