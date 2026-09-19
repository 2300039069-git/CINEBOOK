import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  User,
  Ticket,
  LogOut,
  Film,
  Building,
  Calendar,
  Store,
  LogIn,
  Menu,
  X,
  Sparkles,
  Shield,
  Layers,
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CitySelectorModal from './CitySelectorModal';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const routeLocation = useRouteLocation();
  const navigate = useNavigate();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      setIsSearchModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'Theatres', path: '/theatres', icon: Building },
    { label: 'Offers', path: '/offers', icon: Sparkles },
    { label: 'Events', path: '/events', icon: Calendar },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-md'
            : 'bg-background/95 backdrop-blur-md border-b border-border/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary via-red-600 to-rose-700 flex items-center justify-center text-white shadow-cta group-hover:scale-105 transition-transform duration-200">
                <Film className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-text-primary font-sans leading-none">
                  CINE<span className="text-primary">BOOK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold mt-0.5">
                  Cinema Tickets
                </span>
              </div>
            </Link>

            {/* 2. PRIMARY NAV LINKS (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const isActive = routeLocation.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isActive
                        ? 'text-white bg-primary shadow-cta font-extrabold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* 3. PROMINENT SEARCH BAR (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search movies, languages..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-14 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-bold text-text-muted bg-surface-elevated border border-border rounded cursor-pointer hover:text-text-primary"
                >
                  ⌘K
                </button>
              </div>
            </form>

            {/* 4. RIGHT ACTIONS: Theme Toggle, Location, Partner Desk, User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Theme Toggle Button (Light / Dark) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-surface border border-border hover:border-text-muted text-xs font-bold text-text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-label="Toggle Theme Mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 animate-fade-in" />
                )}
                <span className="hidden xl:inline text-[11px] font-extrabold">
                  {isDark ? "Light" : "Dark"}
                </span>
              </button>

              {/* Location Selector */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-surface border border-border hover:border-slate-400 text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-xs"
                title="Change City"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-bold">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>

              {/* Theatre Partner Portal Link */}
              <Link
                to="/partner"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-border hover:border-gold bg-surface text-text-secondary hover:text-text-primary text-xs font-bold transition-all shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-gold" />
                <span>Partner Portal</span>
              </Link>

              {/* User Authentication Menu / Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface border border-border hover:border-text-muted text-xs font-bold text-text-primary transition-all cursor-pointer shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate text-text-primary">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl p-1.5 shadow-dropdown space-y-1 z-50 text-xs animate-fade-in backdrop-blur-xl">
                      <div className="px-3 py-2 border-b border-border-subtle">
                        <p className="font-extrabold text-text-primary truncate">{user?.name}</p>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-semibold transition-colors"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-semibold transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>My Bookings & Tickets</span>
                      </Link>

                      <Link
                        to="/offers"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-semibold transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Offers & Discounts</span>
                      </Link>

                      <Link
                        to="/partner"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-semibold transition-colors"
                      >
                        <Store className="w-4 h-4 text-gold" />
                        <span>Theatre Exhibitor Desk</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-semibold transition-colors"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Admin Console</span>
                      </Link>

                      <div className="pt-1 border-t border-border-subtle">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold transition-all shadow-cta active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-4 animate-fade-in">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search movies, theatres..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </form>

            <nav className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
              <Link
                to="/movies"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Film className="w-5 h-5 text-primary" />
                <span>Movies</span>
              </Link>
              <Link
                to="/theatres"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Building className="w-5 h-5 text-gold" />
                <span>Theatres</span>
              </Link>
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Offers</span>
              </Link>
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Events</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface text-text-primary font-bold"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                </span>
                <span className="text-text-muted text-[11px] font-extrabold">{isDark ? "Dark" : "Light"}</span>
              </button>

              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface text-text-primary font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> My Bookings
                </span>
                <span className="text-text-muted">→</span>
              </Link>
              <Link
                to="/partner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface text-text-primary font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gold" /> Theatre Partner Desk
                </span>
                <span className="text-text-muted">→</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR NATIVE APP FEEL */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border px-3 py-2 flex items-center justify-around shadow-2xl">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
            routeLocation.pathname === '/' ? 'text-primary font-black' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Film className="w-4.5 h-4.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/movies"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
            routeLocation.pathname === '/movies' ? 'text-primary font-black' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Film className="w-4.5 h-4.5" />
          <span>Movies</span>
        </Link>
        <Link
          to="/theatres"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
            routeLocation.pathname === '/theatres' ? 'text-primary font-black' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Building className="w-4.5 h-4.5" />
          <span>Cinemas</span>
        </Link>
        <Link
          to="/offers"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
            routeLocation.pathname === '/offers' ? 'text-primary font-black' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>Offers</span>
        </Link>
        <Link
          to={user ? "/my-bookings" : "/login"}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
            routeLocation.pathname.includes('bookings') ? 'text-primary font-black' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Ticket className="w-4.5 h-4.5" />
          <span>Tickets</span>
        </Link>
      </div>

      {/* Global Modals */}
      <CitySelectorModal />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Navbar;
