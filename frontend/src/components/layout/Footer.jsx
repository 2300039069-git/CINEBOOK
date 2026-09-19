import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, Ticket, Headphones, Tag, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface text-text-secondary pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-border">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-elevated border border-border shadow-xs">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Instant E-Tickets</h4>
              <p className="text-xs text-text-muted mt-0.5">Live QR passes with real-time seat lock verification</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-elevated border border-border shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Guaranteed Entry</h4>
              <p className="text-xs text-text-muted mt-0.5">100% verified cinema auditoriums & confirmed seats</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-elevated border border-border shadow-xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Exclusive Offers</h4>
              <p className="text-xs text-text-muted mt-0.5">Special promo codes, combo discounts & bank offers</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-elevated border border-border shadow-xs">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">24/7 Priority Support</h4>
              <p className="text-xs text-text-muted mt-0.5">Automated CineBot & instant cancellation refund assistance</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-border">
          {/* Column 1: Brand story & Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-red-600 to-rose-700 flex items-center justify-center text-white shadow-cta">
                <Film className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-black tracking-tight text-text-primary font-sans">
                CINE<span className="text-primary">BOOK</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              India's premier movie ticketing platform delivering unmatched speed, zero-lag seat selection, and verified cinema tickets with transparent zero convenience fees.
            </p>
            
            {/* Security Badges */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Secure Checkout • PCI-DSS Certified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              LEGAL & POLICIES
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Contact Help Desk
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refunds" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Movies & Shows */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              EXPLORE MOVIES
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Cinemas & Showtimes
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Live Events & Premieres
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Exclusive Deals & Combos
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  My E-Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & Help */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/offers" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  Offers & Promo Codes
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  My Bookings & Pass Download
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  24/7 CineBot Support
                </Link>
              </li>
              <li>
                <a href="mailto:support@cinebook.in" className="hover:text-primary transition-colors text-text-secondary hover:text-text-primary font-medium">
                  support@cinebook.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-extrabold text-text-primary tracking-wider">CINEBOOK</span>
            <span>© {new Date().getFullYear()} CineBook Media Technologies Pvt. Ltd. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold text-text-secondary">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/offers" className="hover:text-primary transition-colors">Offers</Link>
            <Link to="/cancellation-refunds" className="hover:text-primary transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
