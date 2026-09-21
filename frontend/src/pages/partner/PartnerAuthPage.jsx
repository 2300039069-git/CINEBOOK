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

import { useAuth } from '../../context/AuthContext';
import CinebookLogo from '../../components/common/CinebookLogo';

const PartnerAuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    theatre_name: '',
    owner_name: '',
    email: '',
    phone: '',
    city: 'Guntur',
    password: '',
    bank_name: '',
    bank_account_num: '',
    ifsc_code: '',
    account_holder: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name: formData.owner_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'THEATRE_ADMIN'
        });
      } else {
        await login(formData.email, formData.password, 'THEATRE_ADMIN');
      }
      navigate('/partner');
    } catch (err) {
      setError(err.message || 'Partner authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center transition-colors relative bg-background text-text-primary">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full bg-surface rounded-3xl p-8 space-y-6 shadow-2xl border border-border relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CinebookLogo size="lg" showWordmark={true} showTagline={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary font-display">
            Exhibitor & Cinema Partner Portal
          </h1>
          <p className="text-xs text-text-muted">
            {isRegister
              ? 'Onboard your cinema to sell tickets online with daily T+1 automated payouts'
              : 'Sign in to manage screens, showtimes, counter quota, and gate scanning'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-surface-elevated border border-border rounded-2xl">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isRegister
                ? 'bg-gradient-to-r from-gold to-amber-500 text-black shadow-gold-glow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Partner Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isRegister
                ? 'bg-gradient-to-r from-gold to-amber-500 text-black shadow-gold-glow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            New Theatre Registration
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted font-bold block mb-1">Theatre Name</label>
                  <input
                    type="text"
                    value={formData.theatre_name}
                    onChange={(e) => setFormData({ ...formData, theatre_name: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="text-text-muted font-bold block mb-1">City / Town</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                  >
                    <option value="Guntur" className="bg-surface text-text-primary">Guntur</option>
                    <option value="Vijayawada" className="bg-surface text-text-primary">Vijayawada</option>
                    <option value="Tenali" className="bg-surface text-text-primary">Tenali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-muted font-bold block mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-text-muted font-bold block mb-1">Partner Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              required
            />
          </div>

          <div>
            <label className="text-text-muted font-bold block mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              required
            />
          </div>

          {isRegister && (
            <div className="p-4 rounded-2xl bg-surface-elevated space-y-3 border border-gold/30">
              <h4 className="text-[11px] font-black uppercase text-gold">T+1 Bank Payout Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted block mb-0.5">Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_num}
                    onChange={(e) => setFormData({ ...formData, bank_account_num: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-xl text-gold font-mono text-xs focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                    className="w-full p-2 bg-background border border-border rounded-xl text-gold font-mono text-xs focus:outline-none focus:border-gold uppercase"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black font-black uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>{isRegister ? 'Complete Onboarding & Access Portal' : 'Sign In to Partner Portal'}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-text-muted">
          <Link to="/" className="text-gold hover:underline">
            ← Return to Customer App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PartnerAuthPage;
