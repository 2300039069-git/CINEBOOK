import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, Store, Lock, Ticket, Headphones } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E131F] text-slate-600 dark:text-slate-400 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Instant E-Tickets</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">QR passes sent directly with live status updates</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Guaranteed Entry</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">100% verified single-screen & multiplex auditoriums</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exhibitor Partner POS</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Zero-latency box office & canteen operations</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">24/7 Priority Concierge</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instant booking resolution & AI ticketing assistance</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-slate-200 dark:border-slate-800">
          {/* Column 1: Brand story */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider text-slate-900 dark:text-slate-100">
                CINE<span className="text-primary">BOOK</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              India's premier cinema technology platform engineered for seamless seat selection, live multi-venue synchronization, box-office counter automation, and luxury moviegoing experiences.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5" /> Atomic Seat Lock
              </span>
            </div>
          </div>

          {/* Column 2: Exhibitor Solutions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              THEATRE PARTNERS
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/partner" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  Exhibitor Portal & POS
                </Link>
              </li>
              <li>
                <Link to="/partner/pos" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Single-Screen Box-Office Counter POS
                </Link>
              </li>
              <li>
                <Link to="/partner/canteen" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Canteen F&B Terminal & Kitchen Display
                </Link>
              </li>
              <li>
                <Link to="/partner/scanner" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Laser Gatekeeper QR Ticket Scanner
                </Link>
              </li>
              <li>
                <Link to="/partner/screens" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Quota Seat Allocation & Floor Maps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Cinemas & Formats */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              FORMATS & REGIONS
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/theatres" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  4K RGB Laser & Dolby Atmos Venues
                </Link>
              </li>
              <li>
                <Link to="/movies?format=imax" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  IMAX 3D & Large Format Screens
                </Link>
              </li>
              <li>
                <Link to="/movies?city=guntur" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Guntur Theatres (Siva 4K, Studio 81, Naz)
                </Link>
              </li>
              <li>
                <Link to="/movies?city=vijayawada" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Vijayawada Theatres (G3 Raj Yuvraj, Alankar)
                </Link>
              </li>
              <li>
                <Link to="/movies?city=tenali" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Tenali Theatres (Asha, SV Cinemas, V-Max)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              EXPLORE & ASSISTANCE
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Now Showing Blockbusters
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Live Events & Premieres
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  My Bookings & Pass Downloads
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Terms of Service & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Privacy Policy & Data Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 tracking-wider">CINEBOOK</span>
            <span>© {new Date().getFullYear()} CineBook Media Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-slate-600 dark:text-slate-400">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/partner" className="hover:text-primary transition-colors">Exhibitor Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
