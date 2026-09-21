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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md pointer-events-auto select-none">
      <nav className="flex items-center justify-around py-2.5 px-3 rounded-2xl bg-[#120F24]/90 backdrop-blur-2xl border border-[#E5A93C]/40 shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(229,169,60,0.25)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                isActive
                  ? 'art-deco-gold-btn text-[#0B0A14] shadow-[0_0_15px_rgba(229,169,60,0.55)] scale-105'
                  : 'text-slate-400 hover:text-[#FFD066] hover:bg-[#1A1633]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={isActive ? 'inline-block' : 'hidden sm:inline-block'}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-[#FFE29A] rounded-full shadow-[0_0_8px_#FFD066]" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
