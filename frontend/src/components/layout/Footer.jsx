import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, Store, Lock, Ticket, Headphones, HelpCircle, FileText, CheckCircle2, CreditCard } from 'lucide-react';

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
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">24/7 Priority Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Helpline: +91 (022) 8000-CINE (10AM–10PM)</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-slate-200 dark:border-slate-800">
          {/* Column 1: Brand story & Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider text-slate-900 dark:text-slate-100 font-display">
                CINE<span className="text-primary">BOOK</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              India's premier movie ticketing platform connecting cinema lovers to local single-screen and multiplex theatres with transparent flat ₹10 convenience fees.
            </p>
            
            {/* Cashfree & SSL Badges */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Secure Checkout | Cashfree Partner</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Lock className="w-3 h-3 text-primary" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> PCI-DSS Level 1
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Support (Cashfree Compliance) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              LEGAL & SUPPORT
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  Contact Us & Help Desk
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refunds" className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Exhibitor Solutions */}
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

          {/* Column 4: Quick Navigation & Theatres */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              EXPLORE & BOOKINGS
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Now Showing Blockbusters
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Partner Theatres & Showtimes
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
                <a href="mailto:support@cinebook.in" className="hover:text-primary transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  Email Support (support@cinebook.in)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright, payment trust badges & legal links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 tracking-wider">CINEBOOK</span>
            <span>© {new Date().getFullYear()} CineBook Media Technologies Pvt. Ltd. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium text-slate-600 dark:text-slate-400">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/cancellation-refunds" className="hover:text-primary transition-colors">Refund Policy</Link>
            <Link to="/partner" className="hover:text-primary transition-colors">Exhibitor Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
