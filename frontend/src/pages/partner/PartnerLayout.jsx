import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3X3,
  CalendarDays,
  ReceiptText,
  QrCode,
  Building2,
  Store,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LogOut,
  Bell,
  CheckCircle2,
  ExternalLink,
  Printer,
  Plus,
  UtensilsCrossed
} from 'lucide-react';
import { THEATRES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTheatreId, setActiveTheatreId] = useState('th-gtr-001');
  const [isTheatreDropdownOpen, setIsTheatreDropdownOpen] = useState(false);

  const activeTheatre = THEATRES.find(t => t.id === activeTheatreId) || THEATRES[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/partner', label: 'Overview Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/partner/counter-pos', label: 'Box-Office Counter POS', icon: Printer },
    { to: '/partner/canteen', label: 'Interval Canteen Orders', icon: UtensilsCrossed },
    { to: '/partner/screens', label: 'Screen & Seat Layouts', icon: Grid3X3 },
    { to: '/partner/shows', label: 'Show Schedules & Pricing', icon: CalendarDays },
    { to: '/partner/settlements', label: 'Daily T+1 Settlements', icon: ReceiptText },
    { to: '/partner/scanner', label: 'Gatekeeper QR Scanner', icon: QrCode },
    { to: '/partner/profile', label: 'Theatre & Bank Details', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F8FAFC] flex flex-col md:flex-row transition-colors">
      {/* 1. PARTNER SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#0F1523] border-r border-[#1E293B] flex flex-col justify-between p-5 space-y-6 flex-shrink-0">
        <div className="space-y-6">
          {/* Exhibitor Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/partner" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#E2B714] flex items-center justify-center text-black shadow-glow-gold group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white font-display leading-none block">
                  PARTNER<span className="text-[#D4AF37]">.</span>
                </span>
                <span className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase">
                  Exhibitor Portal
                </span>
              </div>
            </Link>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase border border-emerald-500/30">
              Verified
            </span>
          </div>

          {/* Active Cinema Switcher Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1">
              Active Multiplex / Cinema
            </label>
            <button
              onClick={() => setIsTheatreDropdownOpen(!isTheatreDropdownOpen)}
              className="w-full p-3 rounded-2xl bg-[#080B10] border border-[#1E293B] flex items-center justify-between text-left hover:border-[#D4AF37] transition-all group cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-white truncate">{activeTheatre.name}</h4>
                <p className="text-[10px] text-[#94A3B8] capitalize">{activeTheatre.city} • Single-Screen 4K Laser</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#94A3B8] transition-transform ${isTheatreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isTheatreDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 p-2 bg-[#0F1523] border border-[#1E293B] rounded-2xl shadow-2xl space-y-1 z-50 animate-fade-in">
                <p className="text-[10px] font-bold text-[#94A3B8] px-2 py-1 uppercase">Switch Managed Theatre</p>
                {THEATRES.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheatreId(t.id);
                      setIsTheatreDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeTheatreId === t.id
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black shadow-sm font-black'
                        : 'text-slate-300 hover:bg-[#172033]'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className="text-[10px] opacity-75 capitalize">{t.city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black shadow-glow-gold'
                        : 'text-[#94A3B8] hover:bg-[#172033] hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Actions */}
        <div className="space-y-3 pt-4 border-t border-[#1E293B]">
          <div className="p-3.5 rounded-2xl bg-[#080B10] border border-[#1E293B] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">T+1 Payout Status</span>
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Settling
              </span>
            </div>
            <p className="text-xs font-black text-[#D4AF37]">SBI (A/C: ****29481)</p>
            <p className="text-[10px] text-[#94A3B8]">Next payout: Tomorrow, 09:00 AM</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#080B10] border border-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer App</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN PARTNER CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-18 bg-[#0F1523]/80 border-b border-[#1E293B] px-6 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <h2 className="text-sm font-black text-white">{activeTheatre.name} Partner Desk</h2>
              <p className="text-[11px] text-[#94A3B8] capitalize">{activeTheatre.city}, AP • Live Online Ticketing Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/partner/counter-pos"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black font-black text-xs shadow-glow-gold transition-all transform hover:scale-105"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Counter POS</span>
            </Link>

            <Link
              to="/partner/scanner"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80710] hover:from-[#B80710] hover:to-[#E50914] text-white text-xs font-black shadow-glow-crimson transition-all transform hover:scale-105"
            >
              <QrCode className="w-4 h-4" />
              <span>Gatekeeper Scanner</span>
            </Link>

            <Link
              to="/partner/shows"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#080B10] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-bold text-white transition-all"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Schedule Show</span>
            </Link>
          </div>
        </header>

        {/* Render Active View */}
        <main className="p-6 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
