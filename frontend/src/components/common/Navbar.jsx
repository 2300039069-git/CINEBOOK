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
      <header className="sticky top-0 z-40 transition-colors duration-300 glass-panel border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* 1. BRAND LOGO */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0B0B14] rounded-[14px] flex items-center justify-center">
                  <Film className="w-6 h-6 text-pink-500 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-tight gradient-text-neon font-display leading-none">
                  CINEBOOK
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-theme-muted mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" /> Next-Gen Cinema
                </span>
              </div>
            </Link>

            {/* 2. CENTER: High-Contrast Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-96">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300" />
                <div className="relative flex items-center bg-[var(--theme-card)] rounded-full border border-[var(--theme-border)] px-3.5 py-2 shadow-sm">
                  <Search className="w-4 h-4 text-pink-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search movies, venues, actors..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent text-xs text-theme-primary placeholder:text-theme-muted focus:outline-none font-medium"
                  />
                  <span className="text-[10px] font-bold text-theme-muted px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded border border-black/10 dark:border-white/10 hidden lg:inline-block">
                    ⌘K
                  </span>
                </div>
              </div>
            </form>

            {/* 3. RIGHT CONTROLS: Location, Theme Switcher, Persona/Sign In */}
            <div className="flex items-center gap-3">
              {/* Exhibitor Quick Access Pill */}
              <Link
                to="/partner"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 hover:border-pink-500 text-xs font-bold text-pink-500 transition-all"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Partner Desk</span>
              </Link>

              {/* Location Pill */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-card text-xs font-black transition-all group"
              >
                <span className="text-base group-hover:scale-125 transition-transform">{selectedCity.icon}</span>
                <span className="hidden sm:inline-block tracking-wide text-theme-primary">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 text-theme-muted" />
              </button>

              {/* DYNAMIC THEME SWITCHER (Colorful / Black / White) */}
              <div className="relative">
                <button
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  title="Switch Theme"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-cyan-500/15 hover:from-pink-500/25 hover:to-cyan-500/25 border border-pink-500/40 text-xs font-black transition-all shadow-sm group"
                >
                  <Palette className="w-4 h-4 text-pink-500 group-hover:rotate-45 transition-transform" />
                  <span className="hidden lg:inline-block font-extrabold text-theme-primary">{theme.name}</span>
                  <span>{theme.icon}</span>
                </button>

                {/* Theme Selector Popover */}
                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl p-3 shadow-2xl space-y-2 z-50 animate-fade-in backdrop-blur-2xl">
                    <div className="px-2 py-1 flex items-center justify-between border-b border-[var(--theme-border)] pb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-pink-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Select UI Experience
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {Object.keys(allThemes).map((key) => {
                        const t = allThemes[key];
                        const isCurrent = currentTheme === key;
                        return (
                          <button
                            key={t.id}
                            onClick={() => { switchTheme(key); setIsThemeMenuOpen(false); }}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 shadow-md scale-102'
                                : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-[var(--theme-border)]'
                            }`}
                          >
                            <span className="text-2xl p-1.5 rounded-xl bg-black/10 dark:bg-black/40">{t.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-theme-primary">{t.name}</p>
                                {isCurrent && (
                                  <span className="text-[9px] font-black text-pink-500 uppercase flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-theme-muted mt-0.5 line-clamp-1">{t.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Authentication Menu or Sign In Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full glass-card text-xs font-semibold transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate font-bold text-theme-primary">{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-theme-muted" />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl p-3.5 shadow-2xl space-y-3 z-50 text-xs backdrop-blur-xl animate-fade-in">
                      <div className="p-2.5 bg-black/5 dark:bg-black/50 rounded-2xl border border-[var(--theme-border)]">
                        <p className="font-black text-theme-primary truncate">{user?.name}</p>
                        <p className="text-[10px] text-theme-muted truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-500 font-black text-[9px] uppercase border border-pink-500/30">
                          {user?.role}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-theme-muted px-1">Switch View</p>
                        <Link
                          to="/partner"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl font-black bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Store className="w-4 h-4" />
                          <span>🏢 Theatre Partner Portal</span>
                        </Link>

                        <button
                          onClick={() => { switchRole('SUPER_ADMIN'); setIsUserMenuOpen(false); navigate('/admin'); }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all ${
                            role === 'SUPER_ADMIN'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                              : 'text-theme-secondary hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                        >
                          ⚡ Super Admin Portal
                        </button>
                        <button
                          onClick={() => { switchRole('CUSTOMER'); setIsUserMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all ${
                            role === 'CUSTOMER'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                              : 'text-theme-secondary hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                        >
                          👤 Customer View
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[var(--theme-border)] flex items-center justify-between">
                        <Link
                          to="/my-bookings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="text-theme-secondary hover:text-pink-500 flex items-center gap-1 font-bold"
                        >
                          <Ticket className="w-3.5 h-3.5 text-pink-500" /> My Tickets
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-rose-500 hover:text-rose-600 font-black flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black shadow-glow-pink transition-all transform hover:scale-105"
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
