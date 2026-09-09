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
  Heart
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import CitySelectorModal from './CitySelectorModal';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { user, role, switchRole, logout } = useAuth();
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
            ? 'bg-[#090A0E]/95 backdrop-blur-md border-b border-[#1E2332] shadow-lg'
            : 'bg-[#090A0E] border-b border-[#161A26]'
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
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-none">
                  CINE<span className="text-primary">BOOK</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
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
                        ? 'text-white bg-surface-elevated font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-surface'
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search movies, theatres..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-14 py-2 bg-surface border border-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-surface-elevated border border-border-subtle rounded cursor-pointer hover:text-white"
                >
                  ⌘K
                </button>
              </div>
            </form>

            {/* 4. RIGHT ACTIONS: Location, Partner Desk, User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Location Selector */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-surface border border-border hover:border-slate-600 text-xs font-medium text-white transition-colors cursor-pointer"
                title="Change City"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-semibold">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Theatre Partner Portal Link */}
              <Link
                to="/partner"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-border hover:border-slate-500 bg-surface-subtle text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-gold" />
                <span>Partner Portal</span>
              </Link>

              {/* User Authentication Menu / Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-surface border border-border hover:border-slate-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate text-slate-200">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-xl p-1.5 shadow-dropdown space-y-1 z-50 text-xs animate-fade-in">
                      <div className="px-3 py-2 border-b border-border-subtle">
                        <p className="font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface font-medium transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>My Bookings & QR Passes</span>
                      </Link>

                      <Link
                        to="/partner"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface font-medium transition-colors"
                      >
                        <Store className="w-4 h-4 text-gold" />
                        <span>Theatre Exhibitor Desk</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surface font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Admin Console</span>
                      </Link>

                      <div className="pt-1 border-t border-border-subtle">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold transition-colors cursor-pointer"
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
                className="lg:hidden p-2 rounded-lg bg-surface border border-border text-slate-300 hover:text-white cursor-pointer"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-[#090A0E] px-4 py-4 space-y-4 animate-fade-in">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies, theatres..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </form>

            <nav className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <Link
                to="/movies"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-white flex flex-col items-center gap-1.5"
              >
                <Film className="w-5 h-5 text-primary" />
                <span>Movies</span>
              </Link>
              <Link
                to="/theatres"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-white flex flex-col items-center gap-1.5"
              >
                <Building className="w-5 h-5 text-gold" />
                <span>Theatres</span>
              </Link>
              <Link
                to="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg bg-surface border border-border text-white flex flex-col items-center gap-1.5"
              >
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Events</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-border-subtle flex flex-col gap-2 text-xs">
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-slate-200 font-medium"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> My Bookings
                </span>
                <span className="text-slate-500">→</span>
              </Link>
              <Link
                to="/partner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface text-slate-200 font-medium"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gold" /> Theatre Partner Desk
                </span>
                <span className="text-slate-500">→</span>
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
