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
    password: 'TheatrePass@2026',
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
    <div className="min-h-screen py-12 px-4 flex items-center justify-center transition-colors relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full bg-[#0F1523]/90 rounded-3xl p-8 space-y-6 shadow-2xl border border-[#1E293B] relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#172033] border border-[#1E293B] flex items-center justify-center text-[#D4AF37] mx-auto shadow-glow-gold">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Exhibitor & Cinema Partner Portal
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {isRegister
              ? 'Onboard your cinema to sell tickets online with daily T+1 automated payouts'
              : 'Sign in to manage screens, showtimes, counter quota, and gate scanning'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-[#080B10] border border-[#1E293B] rounded-2xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isRegister
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black shadow-glow-gold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Partner Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isRegister
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black shadow-glow-gold'
                : 'text-[#94A3B8] hover:text-white'
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
                  <label className="text-[#94A3B8] font-bold block mb-1">Theatre Name</label>
                  <input
                    type="text"
                    value={formData.theatre_name}
                    onChange={(e) => setFormData({ ...formData, theatre_name: e.target.value })}
                    className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#94A3B8] font-bold block mb-1">City / Town</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Guntur" className="bg-[#080B10] text-white">Guntur</option>
                    <option value="Vijayawada" className="bg-[#080B10] text-white">Vijayawada</option>
                    <option value="Tenali" className="bg-[#080B10] text-white">Tenali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] font-bold block mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[#94A3B8] font-bold block mb-1">Partner Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="text-[#94A3B8] font-bold block mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          {isRegister && (
            <div className="p-4 rounded-2xl bg-[#080B10] space-y-3 border border-[#D4AF37]/30">
              <h4 className="text-[11px] font-black uppercase text-[#D4AF37]">T+1 Bank Payout Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#94A3B8] block mb-0.5">Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_num}
                    onChange={(e) => setFormData({ ...formData, bank_account_num: e.target.value })}
                    className="w-full p-2 bg-[#0F1523] border border-[#1E293B] rounded-xl text-[#D4AF37] font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94A3B8] block mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                    className="w-full p-2 bg-[#0F1523] border border-[#1E293B] rounded-xl text-[#D4AF37] font-mono text-xs focus:outline-none focus:border-[#D4AF37] uppercase"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black font-black uppercase tracking-wider shadow-glow-gold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>{isRegister ? 'Complete Onboarding & Access Portal' : 'Sign In to Partner Portal'}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#94A3B8]">
          <Link to="/" className="text-[#D4AF37] hover:underline">
            ← Return to Customer App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartnerAuthPage;
