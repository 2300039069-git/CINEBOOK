import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Ticket,
  Heart,
  ShieldCheck,
  CreditCard,
  Bell,
  Sparkles,
  MapPin,
  ArrowRight,
  Clock,
  QrCode,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Button } from '../../components/ui/Button';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const { selectedCity } = useLocation();
  const [name, setName] = useState(user?.name || 'Moviegoer');
  const [phone, setPhone] = useState(user?.phone || '+91 98480 12345');
  const [saved, setSaved] = useState(false);

  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-text-primary transition-colors">
      {/* 1. VIP User Welcome Card */}
      <div className="p-8 rounded-3xl bg-surface border border-border relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
              alt={user?.name || 'User'}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-surface rounded-full text-xs border border-border shadow-xs">
              👑
            </span>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary font-sans">{name}</h1>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-black uppercase border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>{user?.role || 'VIP CINEMA MEMBER'}</span>
              </span>
            </div>
            <p className="text-xs text-text-muted">{user?.email || 'customer@cinebook.in'}</p>
            <p className="text-xs text-text-secondary flex items-center justify-center sm:justify-start gap-1 pt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Preferred Cinema Hub: <strong className="text-text-primary">{selectedCity?.name || 'Guntur'}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-surface border border-border flex items-center justify-between shadow-card hover:border-primary/40 transition-all">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-text-muted block font-black">Total Bookings</span>
            <span className="text-3xl font-black text-text-primary mt-1 block font-sans">{bookings.length}</span>
            <Link to="/my-bookings" className="text-[11px] text-primary font-bold hover:underline inline-flex items-center gap-1 mt-1">
              <span>View E-Passes</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-primary/15 text-primary border border-primary/30 shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border flex items-center justify-between shadow-card hover:border-amber-500/40 transition-all">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-text-muted block font-black">CineClub Luxe Tier</span>
            <span className="text-3xl font-black text-amber-500 mt-1 block font-sans">850 pts</span>
            <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold block mt-1">₹85 Off Next Ticket</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border flex items-center justify-between shadow-card hover:border-emerald-500/40 transition-all">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-text-muted block font-black">Fast-Check Admission</span>
            <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-1 block">Live QR Ready</span>
            <span className="text-[11px] text-text-muted block mt-1">Auto Gate Verification</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Quick Profile Edit & Settings */}
      <div className="p-8 rounded-3xl bg-surface border border-border space-y-5 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-black text-text-primary uppercase tracking-wider font-sans">
              Personal Profile & Contact
            </h2>
            <p className="text-xs text-text-muted">These details are printed on your Box-Office slips and SMS notifications</p>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Profile preferences updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary text-xs font-bold focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Phone Number for E-Pass SMS</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary text-xs font-bold focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="sm:col-span-2 pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta transition-all cursor-pointer active:scale-95"
            >
              Save Profile
            </button>
            <Link
              to="/my-bookings"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Booking History & Refunds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
