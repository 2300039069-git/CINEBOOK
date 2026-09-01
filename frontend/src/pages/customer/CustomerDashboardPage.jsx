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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const { selectedCity } = useLocation();
  const [name, setName] = useState(user?.name || 'Aarav Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [saved, setSaved] = useState(false);

  const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* User Welcome Card */}
      <div className="p-8 rounded-3xl bg-cine-surface border border-cine-border relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cine-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
            alt={user?.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-cine-primary/60 shadow-glow-primary"
          />
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-display font-extrabold text-white">{name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cine-primary/20 text-cine-primary text-xs font-bold border border-cine-primary/30">
                {user?.role || 'CUSTOMER'}
              </span>
            </div>
            <p className="text-xs text-cine-textMuted">{user?.email || 'customer@example.com'}</p>
            <p className="text-xs text-zinc-300 flex items-center justify-center sm:justify-start gap-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-cine-secondary" />
              <span>Preferred City: <strong className="text-white">{selectedCity.name}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cine-textMuted block font-bold">Total Bookings</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{bookings.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-cine-primary/10 text-cine-primary">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cine-textMuted block font-bold">CineClub Points</span>
            <span className="text-2xl font-extrabold text-cine-gold mt-1 block">420 pts</span>
          </div>
          <div className="p-3 rounded-xl bg-cine-gold/10 text-cine-gold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-cine-textMuted block font-bold">Payment Security</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">Verified Safe</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Profile Edit & Settings */}
      <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">Profile Information</h2>
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            Profile preferences updated successfully!
          </div>
        )}
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-xs focus:outline-none focus:border-cine-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-xs focus:outline-none focus:border-cine-primary"
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cine-primary text-white text-xs font-bold shadow-glow-primary"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
