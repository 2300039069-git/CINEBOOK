import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  Store,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth, VALID_THEATRE_CODES } from '../../context/AuthContext';

const RegisterPage = () => {
  const [accountType, setAccountType] = useState('CUSTOMER'); // 'CUSTOMER' | 'THEATRE_ADMIN'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Theatre-specific fields
  const [theatreName, setTheatreName] = useState('');
  const [city, setCity] = useState('Guntur');
  const [theatreSecretCode, setTheatreSecretCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (accountType === 'THEATRE_ADMIN') {
      if (!theatreSecretCode.trim()) {
        setError('Please enter the Theatre Partner Authorization Code provided by CineBook Admin.');
        return;
      }
      if (!VALID_THEATRE_CODES.includes(theatreSecretCode.trim())) {
        setError('Invalid Theatre Authorization Code! Please enter the master code provided by CineBook Admin (e.g. CINE-THEATRE-2026).');
        return;
      }
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role: accountType,
        theatreName: accountType === 'THEATRE_ADMIN' ? theatreName : undefined,
        city: accountType === 'THEATRE_ADMIN' ? city : undefined,
        theatreSecretCode: accountType === 'THEATRE_ADMIN' ? theatreSecretCode : undefined
      });

      if (accountType === 'THEATRE_ADMIN') {
        navigate('/partner');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0F1523]/90 border border-[#1E293B] rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#172033] border border-[#1E293B] flex items-center justify-center mx-auto text-white shadow-lg">
            {accountType === 'THEATRE_ADMIN' ? (
              <Store className="w-7 h-7 text-[#D4AF37]" />
            ) : (
              <Film className="w-7 h-7 text-[#E50914]" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Create CINE<span className="text-[#E50914]">BOOK</span> Account
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {accountType === 'THEATRE_ADMIN'
              ? 'Exhibitor onboarding for single-screen & multiplex cinema partners'
              : 'Join to reserve cinema seats, download digital passes & unlock offers'}
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="p-1.5 bg-[#080B10] border border-[#1E293B] rounded-2xl flex gap-1.5">
          <button
            type="button"
            onClick={() => { setAccountType('CUSTOMER'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'CUSTOMER'
                ? 'bg-[#E50914] text-white shadow-glow-crimson'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Moviegoer / Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setAccountType('THEATRE_ADMIN'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'THEATRE_ADMIN'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] text-black shadow-glow-gold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Theatre Exhibitor Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Theatre Owner Specific Fields */}
          {accountType === 'THEATRE_ADMIN' && (
            <div className="p-4 rounded-2xl bg-[#080B10] border border-[#D4AF37]/40 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#1E293B]">
                <span className="text-[11px] font-black uppercase text-[#D4AF37] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Cinema & Authorization Details
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Admin Verification Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94A3B8] font-bold block mb-1">Theatre Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Siva Cinemas"
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[#94A3B8] font-bold block mb-1">City Location</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Guntur" className="bg-[#080B10] text-white">Guntur</option>
                    <option value="Vijayawada" className="bg-[#080B10] text-white">Vijayawada</option>
                    <option value="Tenali" className="bg-[#080B10] text-white">Tenali</option>
                  </select>
                </div>
              </div>

              {/* Secret Exhibitor Authorization Code */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#D4AF37] font-black flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Exhibitor Partner Authorization Code *
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter Code (e.g. CINE-THEATRE-2026 or 2026)"
                  value={theatreSecretCode}
                  onChange={(e) => setTheatreSecretCode(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#0F1523] border border-[#D4AF37]/50 rounded-xl text-[#D4AF37] font-mono font-black placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37] tracking-wider"
                />
                <p className="text-[10px] text-[#94A3B8] mt-1">
                  💡 Valid Demo Code: <code className="text-[#D4AF37] font-bold">CINE-THEATRE-2026</code> or <code className="text-[#D4AF37] font-bold">2026</code>
                </p>
              </div>
            </div>
          )}

          {/* Common Profile Fields */}
          <div>
            <label className="text-[#94A3B8] font-bold block mb-1">
              {accountType === 'THEATRE_ADMIN' ? 'Owner / Manager Name' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={accountType === 'THEATRE_ADMIN' ? 'K. Siva Rama Krishna' : 'Aarav Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  placeholder={accountType === 'THEATRE_ADMIN' ? 'partner@sivacinemas.com' : 'user@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="tel"
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[#94A3B8] font-bold block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer ${
              accountType === 'THEATRE_ADMIN'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black shadow-glow-gold'
                : 'bg-gradient-to-r from-[#E50914] to-[#B80710] hover:from-[#B80710] hover:to-[#E50914] text-white shadow-glow-crimson'
            }`}
          >
            <span>{loading ? 'Creating Account...' : accountType === 'THEATRE_ADMIN' ? 'Validate Code & Register Theatre' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#E50914] font-black hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
