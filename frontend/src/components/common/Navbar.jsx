import React, { useState, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  Search,
  MapPin,
  Sun,
  Moon,
  Ticket,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  Tag,
  Calendar,
  Building,
  Shield,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import SearchModal from './SearchModal';

export const Navbar = () => {
  const { user, logout, isTheatreAdmin, isSuperAdmin } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [routerLocation.pathname]);

  const navLinks = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'Cinemas', path: '/theatres', icon: Building },
    { label: 'Offers', path: '/offers', icon: Tag, badge: 'Deals' },
    { label: 'Events', path: '/events', icon: Calendar },
  ];

  return (
    <>
      {/* LUXURY CINEMA TOP APP BAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-[#171b34]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
            : 'py-4 bg-[#171b34]/80 backdrop-blur-xl border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Crescent-moon Logo + Cinebook Wordmark in Gold */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group select-none">
                {/* Crescent-moon icon styled as luxury cinema mark */}
                <div className="w-10 h-10 rounded-2xl bg-[#1e2348] border border-[#e0b45c]/40 flex items-center justify-center text-[#e0b45c] shadow-[0_0_16px_rgba(224,180,92,0.4)] group-hover:scale-105 transition-transform duration-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-[#e0b45c] drop-shadow-[0_0_8px_rgba(224,180,92,0.8)]"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#goldGrad)" stroke="#e0b45c" />
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f6dd9c" />
                        <stop offset="50%" stopColor="#e0b45c" />
                        <stop offset="100%" stopColor="#b8862f" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight font-display bg-gradient-to-r from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] bg-clip-text text-transparent leading-none">
                    Cinebook
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#a8adc9] mt-0.5 font-sans">
                    Luxury Cinema
                  </span>
                </div>
              </Link>

              {/* City Selector Pill */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/10 hover:border-[#e0b45c] text-xs font-semibold text-white transition-all cursor-pointer shadow-sm group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#e0b45c] group-hover:scale-110 transition-transform" />
                <span>{selectedCity?.name || 'Guntur'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b7094]" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 p-1.5 bg-[#1e2348]/90 border border-white/10 rounded-full backdrop-blur-md">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? routerLocation.pathname === '/'
                    : routerLocation.pathname.startsWith(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'luxury-gold-btn text-[#171b34] font-bold'
                        : 'text-[#a8adc9] hover:text-white hover:bg-[#262b52]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-[#171b34]/20 text-[#171b34]' : 'bg-[#e0b45c]/20 text-[#f6dd9c]'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Theme Toggle, Auth) */}
            <div className="flex items-center gap-2.5">
              {/* Search Modal Trigger with Diamond Accent */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/10 hover:border-[#e0b45c] text-xs font-medium text-[#a8adc9] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(224,180,92,0.35)]"
                title="Search movies, cast, cinemas (Cmd+K / Ctrl+K)"
              >
                <Search className="w-4 h-4 text-[#e0b45c]" />
                <span className="hidden sm:inline text-xs font-medium">Search...</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#171b34] border border-white/10 text-[9px] font-mono text-[#e0b45c]">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Switcher Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/10 text-[#a8adc9] hover:text-white transition-all cursor-pointer shadow-sm"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#e0b45c]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#a8adc9]" />
                )}
              </button>

              {/* User Profile / Login */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#1e2348] hover:bg-[#262b52] border border-white/10 hover:border-[#e0b45c] transition-all cursor-pointer shadow-[0_0_12px_rgba(224,180,92,0.25)]"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] flex items-center justify-center text-[#171b34] text-xs font-black shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-white hidden sm:inline max-w-[90px] truncate">
                      {user.name || 'Member'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#6b7094]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1e2348] border border-white/10 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-[#a8adc9] truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#e0b45c]/20 text-[#f6dd9c] text-[9px] font-black uppercase tracking-wider">
                          {user.role || 'VIP MEMBER'}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a8adc9] hover:text-white hover:bg-[#262b52] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#e0b45c]" />
                        <span>Profile Dashboard</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a8adc9] hover:text-white hover:bg-[#262b52] transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#e0b45c]" />
                        <span>My E-Tickets & Passes</span>
                      </Link>

                      {isTheatreAdmin && (
                        <Link
                          to="/partner"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a8adc9] hover:text-white hover:bg-[#262b52] transition-colors"
                        >
                          <Store className="w-4 h-4 text-[#e0b45c]" />
                          <span>Exhibitor Portal</span>
                        </Link>
                      )}

                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a8adc9] hover:text-white hover:bg-[#262b52] transition-colors"
                        >
                          <Shield className="w-4 h-4 text-rose-400" />
                          <span>Super Admin</span>
                        </Link>
                      )}

                      <div className="pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                  className="luxury-gold-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-[0_0_16px_rgba(224,180,92,0.4)]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full bg-[#1e2348] border border-white/10 text-[#a8adc9] hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#e0b45c]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#1e2348] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => {
                setIsCityModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#262b52] border border-white/10 text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e0b45c]" />
                <span>City: {selectedCity?.name}</span>
              </span>
              <span className="text-[10px] text-[#e0b45c] uppercase font-black">Change</span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#262b52] text-xs font-bold text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#e0b45c]" />
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-[#e0b45c]/20 text-[#f6dd9c] text-[9px] font-black uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* INTERACTIVE GLOBAL SEARCH MODAL */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
