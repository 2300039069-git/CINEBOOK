import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Ticket, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide bottom nav on specific fullscreen views like Seat Selection & Partner POS
  if (
    location.pathname.startsWith('/seat-selection') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/partner')
  ) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Discover', path: '/movies', icon: Compass },
    { label: 'Tickets', path: user ? '/my-bookings' : '/login', icon: Ticket },
    { label: 'Profile', path: user ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md pointer-events-auto">
      <nav className="flex items-center justify-around py-2 px-3 rounded-full bg-[#121824]/90 backdrop-blur-2xl border border-[#E5A93C]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(229,169,60,0.2)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0E14] shadow-[0_0_15px_rgba(229,169,60,0.5)] scale-105'
                  : 'text-text-secondary hover:text-[#FFD066] hover:bg-surface-elevated/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={isActive ? 'inline-block font-black' : 'hidden sm:inline-block'}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
