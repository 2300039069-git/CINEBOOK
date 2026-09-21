import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Film, Ticket, Headphones, Tag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#171b34] text-[#a8adc9] pt-16 pb-28 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#1e2348] border border-white/10 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#e0b45c]/15 text-[#e0b45c]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant E-Tickets</h4>
              <p className="text-xs text-[#a8adc9] mt-0.5">Live QR passes with real-time seat lock verification</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#1e2348] border border-white/10 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Guaranteed Entry</h4>
              <p className="text-xs text-[#a8adc9] mt-0.5">100% verified cinema auditoriums & confirmed seats</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#1e2348] border border-white/10 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#e0b45c]/15 text-[#e0b45c]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Exclusive Offers</h4>
              <p className="text-xs text-[#a8adc9] mt-0.5">Special promo codes, combo discounts & bank offers</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#1e2348] border border-white/10 shadow-xs">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Priority Support</h4>
              <p className="text-xs text-[#a8adc9] mt-0.5">Automated CineBot & instant cancellation refund assistance</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-white/10">
          {/* Column 1: Brand story & Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1e2348] border border-[#e0b45c]/40 flex items-center justify-center text-[#e0b45c] shadow-[0_0_12px_rgba(224,180,92,0.4)]">
                <Film className="w-4 h-4 text-[#e0b45c]" />
              </div>
              <span className="text-xl font-black tracking-tight font-display bg-gradient-to-r from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] bg-clip-text text-transparent">
                Cinebook
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#a8adc9]">
              Premier luxury cinema ticketing platform delivering instant seat locking, high-fidelity auditoriums, and verified digital entry passes.
            </p>
            
            {/* Security Badges */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Secure Checkout • Direct Bank Settlement</span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0b45c]" />
              LEGAL & POLICIES
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Contact Help Desk
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refunds" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Explore Movies */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0b45c]" />
              EXPLORE MOVIES
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Cinemas & Showtimes
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Live Events & Premieres
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  Exclusive Deals & Combos
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-[#e0b45c] transition-colors text-[#a8adc9] hover:text-white font-medium">
                  My Bookings & Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Exhibitor Portal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0b45c]" />
              EXHIBITOR PARTNER
            </h3>
            <p className="text-xs text-[#a8adc9] leading-relaxed">
              Cinema exhibitor or multiplex owner? Partner with Cinebook for unified ticketing and automated Box Office settlement.
            </p>
            <Link
              to="/partner"
              className="inline-block px-4 py-2 rounded-full bg-[#1e2348] border border-[#e0b45c]/40 text-[#e0b45c] hover:bg-[#e0b45c]/15 text-xs font-bold transition-all shadow-sm"
            >
              Exhibitor Dashboard →
            </Link>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6b7094] gap-4">
          <p>© {new Date().getFullYear()} CineBook Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made with Luxury Cinema Craftsmanship</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
