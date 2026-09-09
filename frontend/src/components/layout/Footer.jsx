import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Store, Lock, Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[#1E293B] bg-[#080B10] text-[#F8FAFC] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 3-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-[#1E293B]">
          {/* Column 1: PARTNER WITH US */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              THEATRE EXHIBITOR PARTNERS
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/partner" className="hover:text-[#D4AF37] hover:underline transition-colors flex items-center gap-1.5 font-bold">
                  <Store className="w-3.5 h-3.5 text-[#D4AF37]" /> Exhibitor Partner Portal & POS
                </Link>
              </li>
              <li>
                <Link to="/partner/pos" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Single-Screen Box-Office Counter POS
                </Link>
              </li>
              <li>
                <Link to="/partner/screens" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Dual-Quota Seat Allocation (Counter vs Online)
                </Link>
              </li>
              <li>
                <Link to="/partner/scanner" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Laser Gatekeeper QR Verification System
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: EXPLORE THEATERS */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              EXPLORE CINEMA VENUES
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/movies?city=guntur" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Guntur Theatres (Siva 4K Laser, Studio 81, Naz Complex)
                </Link>
              </li>
              <li>
                <Link to="/movies?city=vijayawada" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Vijayawada Theatres (G3 Raj Yuvraj, Alankar 4K)
                </Link>
              </li>
              <li>
                <Link to="/movies?city=tenali" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  Tenali Theatres (Asha, SV Cinemas Priya, V-Max)
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-[#D4AF37] hover:underline transition-colors">
                  4K RGB Laser & Dolby Atmos 64-Channel Audis
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT CINEBOOK */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              ABOUT CINEBOOK PLATINUM
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CineBook is an executive cinema-technology platform engineered for instantaneous seat reservations, zero-fee box-office counter ticketing, interval snack fulfillment, and automated T+1 exhibitor settlements.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                <Lock className="w-4 h-4" /> Atomic Concurrency Locked
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider gradient-text-gold text-sm">CINEBOOK</span>
            <span>© 2026 CineBook Media Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/terms" className="hover:text-[#D4AF37]">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-[#D4AF37]">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
