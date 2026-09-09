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
    { label: 'Events', path: '/events', icon: Calendar },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
            : 'bg-background border-b border-border-subtle'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-cta group-hover:scale-105 transition-transform duration-200">
                <Film className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-text-primary font-sans leading-none">
                  CINE<span className="text-primary">BOOK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold mt-0.5">
                  Cinema Tickets
                </span>
              </div>
            </Link>

            {/* 2. PRIMARY NAV LINKS (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = routeLocation.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'text-white bg-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
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
                  placeholder="Search movies, theatres..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-14 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-muted bg-surface-elevated border border-border-subtle rounded cursor-pointer hover:text-text-primary"
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
                className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-surface border border-border hover:border-text-muted text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme Mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
                <span className="hidden xl:inline text-[11px] font-bold">
                  {isDark ? "Light" : "Dark"}
                </span>
              </button>

              {/* Location Selector */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-surface border border-border hover:border-slate-500 text-xs font-medium text-text-primary transition-colors cursor-pointer"
                title="Change City"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-semibold">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>

              {/* Theatre Partner Portal Link */}
              <Link
                to="/partner"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-border hover:border-gold bg-surface text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-gold" />
                <span>Partner Portal</span>
              </Link>

              {/* User Authentication Menu / Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-surface border border-border hover:border-text-muted text-xs font-semibold text-text-primary transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate text-text-primary">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl p-1.5 shadow-dropdown space-y-1 z-50 text-xs animate-fade-in">
                      <div className="px-3 py-2 border-b border-border-subtle">
                        <p className="font-bold text-text-primary truncate">{user?.name}</p>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>My Bookings & QR Passes</span>
                      </Link>

                      <Link
                        to="/partner"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium transition-colors"
                      >
                        <Store className="w-4 h-4 text-gold" />
                        <span>Theatre Exhibitor Desk</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Admin Console</span>
                      </Link>

                      <div className="pt-1 border-t border-border-subtle">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-cta"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary cursor-pointer"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </form>

            <nav className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <Link
                to="/movies"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Film className="w-5 h-5 text-primary" />
                <span>Movies</span>
              </Link>
              <Link
                to="/theatres"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Building className="w-5 h-5 text-gold" />
                <span>Theatres</span>
              </Link>
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-text-primary flex flex-col items-center gap-1.5"
              >
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span>Events</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-text-primary font-medium"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{isDark ? "Switch to Daylight Theme" : "Switch to Midnight Theme"}</span>
                </span>
                <span className="text-text-muted text-[11px] font-bold">{isDark ? "Dark Mode" : "Light Mode"}</span>
              </button>

              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-text-primary font-medium"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> My Bookings
                </span>
                <span className="text-text-muted">→</span>
              </Link>
              <Link
                to="/partner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-text-primary font-medium"
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

      {/* Global Modals */}
      <CitySelectorModal />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Navbar;
