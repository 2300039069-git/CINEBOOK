import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Building2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const PartnerAuthPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    theatre_name: 'Siva Cinemas',
    owner_name: 'K. Siva Rama Krishna',
    email: 'partner@sivacinemas.com',
    phone: '+91 98480 12345',
    city: 'Guntur',
    password: 'password123',
    bank_name: 'State Bank of India',
    bank_account_num: '308491029481',
    ifsc_code: 'SBIN0000840',
    account_holder: 'Siva Cinemas Exhibitors LLP'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/partner');
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center transition-colors">
      <div className="max-w-xl w-full glass-panel rounded-3xl p-8 space-y-6 shadow-2xl border border-[var(--theme-border)]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-glow-pink">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary font-display">
            Exhibitor & Theatre Partner Portal
          </h1>
          <p className="text-xs text-theme-muted">
            {isRegister
              ? 'Onboard your cinema to sell tickets online with daily T+1 automated payouts'
              : 'Sign in to manage screens, showtimes, counter quota, and gate scanning'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 glass-card rounded-2xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              !isRegister
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            Partner Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              isRegister
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            New Theatre Registration
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-theme-muted font-bold block mb-1">Theatre Name</label>
                  <input
                    type="text"
                    value={formData.theatre_name}
                    onChange={(e) => setFormData({ ...formData, theatre_name: e.target.value })}
                    className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-theme-muted font-bold block mb-1">City / Town</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  >
                    <option value="Guntur" className="bg-[#131527] text-white">Guntur</option>
                    <option value="Vijayawada" className="bg-[#131527] text-white">Vijayawada</option>
                    <option value="Tenali" className="bg-[#131527] text-white">Tenali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-theme-muted font-bold block mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-theme-muted font-bold block mb-1">Partner Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="text-theme-muted font-bold block mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          {isRegister && (
            <div className="p-4 rounded-2xl glass-card space-y-3 border border-amber-500/30">
              <h4 className="text-[11px] font-black uppercase text-amber-500">T+1 Bank Payout Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-theme-muted block mb-0.5">Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_num}
                    onChange={(e) => setFormData({ ...formData, bank_account_num: e.target.value })}
                    className="w-full p-2 glass-panel rounded-xl text-theme-primary font-mono text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-theme-muted block mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                    className="w-full p-2 glass-panel rounded-xl text-theme-primary font-mono text-xs focus:outline-none uppercase"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black uppercase tracking-wider shadow-glow-pink flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'Complete Onboarding & Access Portal' : 'Sign In to Partner Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-theme-muted">
          <Link to="/" className="text-pink-500 hover:underline">
            ← Return to Customer App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartnerAuthPage;
