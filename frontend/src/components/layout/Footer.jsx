import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 3-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-[var(--theme-border)]">
          {/* Column 1: PARTNER WITH US */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-theme-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              PARTNER WITH US
            </h3>
            <ul className="space-y-2.5 text-xs text-theme-secondary">
              <li>
                <Link to="/theatre-admin" className="hover:text-pink-500 hover:underline transition-colors">
                  List Your Cinema & Multiplex
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-pink-500 hover:underline transition-colors">
                  Promote & Host Live Events
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-pink-500 hover:underline transition-colors">
                  Advertise on CineBook Screens
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-pink-500 hover:underline transition-colors">
                  Corporate & Bulk Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: EXPLORE THEATERS */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-theme-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              EXPLORE THEATERS
            </h3>
            <ul className="space-y-2.5 text-xs text-theme-secondary">
              <li>
                <Link to="/movies" className="hover:text-pink-500 hover:underline transition-colors">
                  Guntur Cinemas (Siva, Studio 81, Naz, Bhaskar)
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-pink-500 hover:underline transition-colors">
                  Vijayawada Theatres (G3 Raj Yuvraj, Alankar)
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-pink-500 hover:underline transition-colors">
                  Tenali Theatres (Asha, SV Cinemas Priya, V-Max)
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-pink-500 hover:underline transition-colors">
                  IMAX 3D Laser & Dolby Atmos 7.1 Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT CINEBOOK */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-theme-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              ABOUT CINEBOOK
            </h3>
            <p className="text-xs text-theme-secondary leading-relaxed">
              CineBook is an ultra-modern cinema ticketing platform engineered for fast seat selection, instant QR verification, and real-time concurrency locking.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Secured
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider gradient-text-neon text-sm">CINEBOOK</span>
            <span>© 2026 CineBook Media Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/terms" className="hover:text-pink-500">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-pink-500">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-pink-500">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
