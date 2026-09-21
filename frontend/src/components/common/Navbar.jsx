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
  Sparkles,
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

  // Close menus on route change
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
      {/* 1. LUXURY OBSIDIAN & NEON GOLD HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-[#0B0E14]/90 backdrop-blur-2xl border-b border-[#E5A93C]/25 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
            : 'py-4 bg-[#0B0E14]/70 backdrop-blur-xl border-b border-[#E5A93C]/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Brand Identity & City Picker */}
            <div className="flex items-center gap-6">
              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-2.5 group select-none">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E5A93C] to-[#FFD066] flex items-center justify-center text-[#0B0E14] shadow-[0_0_15px_rgba(229,169,60,0.45)] group-hover:scale-105 transition-transform duration-300">
                  <Film className="w-5 h-5 text-[#0B0E14] transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight font-display text-white leading-none">
                    CINE<span className="text-[#FFD066] text-shadow-[0_0_10px_rgba(229,169,60,0.6)]">BOOK</span>
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E5A93C] mt-0.5">
                    Premium Cinema Pass
                  </span>
                </div>
              </Link>

              {/* City Selector Pill */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121824] hover:bg-[#1A2234] border border-[#E5A93C]/25 text-xs font-bold text-white transition-all cursor-pointer shadow-xs hover:border-[#E5A93C]/60 group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E5A93C] group-hover:scale-110 transition-transform" />
                <span>{selectedCity?.name || 'Guntur'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#121824]/80 border border-[#E5A93C]/20 rounded-2xl backdrop-blur-md">
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
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0E14] shadow-[0_0_15px_rgba(229,169,60,0.5)] font-black'
                        : 'text-slate-300 hover:text-white hover:bg-[#1A2234]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-[#0B0E14]/20 text-[#0B0E14]' : 'bg-[#E5A93C]/20 text-[#FFD066]'
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
              {/* Search Modal Trigger with Glowing Golden Frame */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121824] hover:bg-[#1A2234] border border-[#E5A93C]/40 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(229,169,60,0.15)] hover:shadow-[0_0_15px_rgba(229,169,60,0.35)]"
                title="Search movies, cast, cinemas (Cmd+K / Ctrl+K)"
              >
                <Search className="w-4 h-4 text-[#FFD066]" />
                <span className="hidden sm:inline text-xs font-semibold">Search movies...</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#0B0E14] border border-[#E5A93C]/30 text-[9px] font-mono text-[#FFD066]">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Switcher Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-[#121824] hover:bg-[#1A2234] border border-[#E5A93C]/25 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#FFD066]" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* User Profile / Login */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#121824] hover:bg-[#1A2234] border border-[#E5A93C]/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(229,169,60,0.2)]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E5A93C] to-[#FFD066] flex items-center justify-center text-[#0B0E14] text-xs font-black shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-white hidden sm:inline max-w-[90px] truncate">
                      {user.name || 'Member'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121824] border border-[#E5A93C]/30 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                      <div className="px-3 py-2 border-b border-[#E5A93C]/20">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#FFD066] text-[9px] font-black uppercase tracking-wider">
                          {user.role || 'VIP MEMBER'}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1A2234] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#E5A93C]" />
                        <span>Profile Dashboard</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1A2234] transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#FFD066]" />
                        <span>My E-Tickets & Passes</span>
                      </Link>

                      {isTheatreAdmin && (
                        <Link
                          to="/partner"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1A2234] transition-colors"
                        >
                          <Store className="w-4 h-4 text-[#FFD066]" />
                          <span>Exhibitor Portal</span>
                        </Link>
                      )}

                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1A2234] transition-colors"
                        >
                          <Shield className="w-4 h-4 text-rose-400" />
                          <span>Super Admin</span>
                        </Link>
                      )}

                      <div className="pt-1 border-t border-[#E5A93C]/20">
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
                  className="gold-glow-btn px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-[#121824] border border-[#E5A93C]/25 text-slate-300 hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#FFD066]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5A93C]/20 bg-[#121824] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => {
                setIsCityModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1A2234] border border-[#E5A93C]/25 text-xs font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E5A93C]" />
                <span>City: {selectedCity?.name}</span>
              </span>
              <span className="text-[10px] text-[#FFD066] uppercase font-black">Change</span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1A2234] text-xs font-bold text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#FFD066]" />
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-[#E5A93C]/20 text-[#FFD066] text-[9px] font-black uppercase">
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
