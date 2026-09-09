import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  User,
  Ticket,
  LogOut,
  Palette,
  Film,
  Flame,
  Zap,
  Check,
  Store,
  LogIn
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEMES } from '../../context/ThemeContext';
import CitySelectorModal from './CitySelectorModal';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { user, role, switchRole, logout } = useAuth();
  const { currentTheme, switchTheme, allThemes, theme } = useTheme();
  
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

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
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080B10]/90 backdrop-blur-xl border-b border-[#1E293B] shadow-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#E50914] to-amber-500 p-[2px] shadow-glow-crimson group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#080B10] rounded-[14px] flex items-center justify-center">
                  <Film className="w-6 h-6 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E50914] animate-ping" />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-tight gradient-text-gold font-display leading-none">
                  CINEBOOK
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#94A3B8] mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" /> LUXE CINEMA TECH
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-300">
              <Link to="/movies" className="hover:text-[#D4AF37] transition-colors">Movies</Link>
              <Link to="/theatres" className="hover:text-[#D4AF37] transition-colors">Theatres</Link>
              <Link to="/events" className="hover:text-[#D4AF37] transition-colors">Live Events</Link>
            </nav>

            {/* 2. CENTER: High-Contrast Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64 lg:w-80">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/40 to-[#E50914]/40 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300" />
                <div className="relative flex items-center bg-[#0F1523] rounded-full border border-[#1E293B] px-3.5 py-2 shadow-sm">
                  <Search className="w-4 h-4 text-[#D4AF37] mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search movies, theatres, cities..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder:text-[#94A3B8] focus:outline-none font-medium"
                  />
                  <span className="text-[10px] font-bold text-[#94A3B8] px-1.5 py-0.5 bg-black/40 rounded border border-white/10 hidden lg:inline-block">
                    ⌘K
                  </span>
                </div>
              </div>
            </form>

            {/* 3. RIGHT CONTROLS: Location, Partner Login (HIGH VISIBILITY), User Sign In */}
            <div className="flex items-center gap-3">
              {/* HIGH VISIBILITY THEATRE PARTNER LOGIN BUTTON */}
              <Link
                to="/partner"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 to-amber-500/10 border-2 border-[#D4AF37] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-slate-950 text-xs font-black uppercase tracking-wider shadow-glow-gold transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Partner Desk</span>
              </Link>

              {/* Location Pill */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0F1523] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-black transition-all group cursor-pointer"
              >
                <span className="text-base group-hover:scale-125 transition-transform">{selectedCity.icon}</span>
                <span className="hidden sm:inline-block tracking-wide text-white">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {/* User Authentication Menu or Sign In Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate font-bold text-white">{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#0F1523] border border-[#1E293B] rounded-3xl p-3.5 shadow-2xl space-y-3 z-50 text-xs backdrop-blur-xl animate-fade-in">
                      <div className="p-2.5 bg-black/50 rounded-2xl border border-[#1E293B]">
                        <p className="font-black text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-[#94A3B8] truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-black text-[9px] uppercase border border-[#D4AF37]/30">
                          {user?.role}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-[#94A3B8] px-1">Switch View</p>
                        <Link
                          to="/partner"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl font-black bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2"
                        >
                          <Store className="w-4 h-4" />
                          <span>🏢 Theatre Partner Portal</span>
                        </Link>

                        <button
                          onClick={() => { switchRole('SUPER_ADMIN'); setIsUserMenuOpen(false); navigate('/admin'); }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                            role === 'SUPER_ADMIN'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 shadow-md font-black'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          ⚡ Super Admin Portal
                        </button>
                        <button
                          onClick={() => { switchRole('CUSTOMER'); setIsUserMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                            role === 'CUSTOMER'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 shadow-md font-black'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          👤 Customer View
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                        <Link
                          to="/my-bookings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-slate-300 hover:text-[#D4AF37] flex items-center gap-1 font-bold"
                        >
                          <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" /> My Tickets
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-rose-500 hover:text-rose-400 font-black flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-gradient-to-r from-[#E50914] to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white text-xs font-black uppercase tracking-wider shadow-glow-crimson transition-all transform hover:scale-105"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <CitySelectorModal />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Navbar;
