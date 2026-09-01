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
      const user = await register({
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl space-y-6 border border-[var(--theme-border)]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-glow-pink">
            {accountType === 'THEATRE_ADMIN' ? <Store className="w-7 h-7" /> : <Film className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-theme-primary tracking-tight">
            Create Cine<span className="text-pink-500">Book</span> Account
          </h1>
          <p className="text-xs text-theme-muted">
            {accountType === 'THEATRE_ADMIN'
              ? 'Exhibitor onboarding for single-screen & multiplex cinema partners'
              : 'Join to reserve cinema seats, download digital passes & unlock offers'}
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="p-1.5 glass-card rounded-2xl flex gap-1.5">
          <button
            type="button"
            onClick={() => { setAccountType('CUSTOMER'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              accountType === 'CUSTOMER'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-101'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Moviegoer / Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setAccountType('THEATRE_ADMIN'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              accountType === 'THEATRE_ADMIN'
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white shadow-md scale-101'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Theatre Exhibitor Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Theatre Owner Specific Fields */}
          {accountType === 'THEATRE_ADMIN' && (
            <div className="p-4 rounded-2xl glass-card space-y-3 border border-pink-500/40">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--theme-border)]">
                <span className="text-[11px] font-black uppercase text-pink-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Cinema & Authorization Details
                </span>
                <span className="text-[9px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                  Admin Verification Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-theme-muted font-bold block mb-1">Theatre Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Siva Cinemas"
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    required
                    className="w-full p-2.5 glass-panel rounded-xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="text-theme-muted font-bold block mb-1">City Location</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 glass-panel rounded-xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
                  >
                    <option value="Guntur" className="bg-[#131527] text-white">Guntur</option>
                    <option value="Vijayawada" className="bg-[#131527] text-white">Vijayawada</option>
                    <option value="Tenali" className="bg-[#131527] text-white">Tenali</option>
                  </select>
                </div>
              </div>

              {/* Secret Exhibitor Authorization Code */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-amber-500 font-black flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Exhibitor Partner Authorization Code *
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter Secret Code (e.g. CINE-THEATRE-2026 or 2026)"
                  value={theatreSecretCode}
                  onChange={(e) => setTheatreSecretCode(e.target.value)}
                  required
                  className="w-full p-2.5 glass-panel rounded-xl text-amber-400 font-mono font-black placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 tracking-wider shadow-inner"
                />
                <p className="text-[10px] text-theme-muted mt-1">
                  💡 This code is provided by CineBook Admin to authorized theatre owners.
                </p>
              </div>
            </div>
          )}

          {/* Common Profile Fields */}
          <div>
            <label className="text-theme-muted font-bold block mb-1">
              {accountType === 'THEATRE_ADMIN' ? 'Owner / Manager Name' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="text"
                placeholder={accountType === 'THEATRE_ADMIN' ? 'K. Siva Rama Krishna' : 'Aarav Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-theme-muted font-bold block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="email"
                  placeholder={accountType === 'THEATRE_ADMIN' ? 'partner@sivacinemas.com' : 'user@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="tel"
                  placeholder="+91 98480 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-theme-muted font-bold block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black uppercase tracking-wider shadow-glow-pink transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : accountType === 'THEATRE_ADMIN' ? 'Validate Code & Register Theatre' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--theme-border)] text-center text-xs text-theme-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-500 font-black hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
