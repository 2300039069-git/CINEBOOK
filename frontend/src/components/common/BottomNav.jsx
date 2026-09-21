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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#171b34]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] py-2.5 px-6 pointer-events-auto select-none">
      <nav className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors duration-200 group"
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? 'text-[#e0b45c] drop-shadow-[0_0_8px_rgba(224,180,92,0.6)] scale-110'
                    : 'text-[#6b7094] group-hover:text-[#a8adc9]'
                }`}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-[#e0b45c] font-bold' : 'text-[#6b7094] group-hover:text-[#a8adc9]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#e0b45c] rounded-full shadow-[0_0_8px_#e0b45c]" />
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Centered thin bottom indicator bar matching mockup */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2" />
    </div>
  );
};

export default BottomNav;
