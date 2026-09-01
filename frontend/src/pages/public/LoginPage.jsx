import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, User, Store, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER, THEATRE_ADMIN, SUPER_ADMIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (role === 'THEATRE_ADMIN' ? '/partner' : role === 'SUPER_ADMIN' ? '/admin' : '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in both email and password.');
      }
      const loggedUser = await login(email, password, role);
      
      if (loggedUser.role === 'THEATRE_ADMIN') {
        navigate('/partner', { replace: true });
      } else if (loggedUser.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'SUPER_ADMIN') {
      setEmail('kancharladhanush2003@gmail.com');
      setPassword('AdminPass@2026');
    } else if (demoRole === 'THEATRE_ADMIN') {
      setEmail('partner@sivacinemas.com');
      setPassword('TheatrePass@2026');
    } else {
      setEmail('aarav.sharma@example.com');
      setPassword('CustomerPass@2026');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl space-y-6 border border-[var(--theme-border)]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-glow-pink mx-auto text-white">
            {role === 'THEATRE_ADMIN' ? <Store className="w-7 h-7" /> : role === 'SUPER_ADMIN' ? <Shield className="w-7 h-7" /> : <Film className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-theme-primary tracking-tight">
            Sign In to Cine<span className="text-pink-500">Book</span>
          </h1>
          <p className="text-xs text-theme-muted">
            {role === 'THEATRE_ADMIN'
              ? 'Access your Exhibitor Dashboard, Screen Layouts & Gate Scanner'
              : role === 'SUPER_ADMIN'
              ? 'Access Super Admin master platform controls'
              : 'Sign in to access your digital tickets & seat bookings'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="p-1.5 glass-card rounded-2xl flex gap-1">
          <button
            type="button"
            onClick={() => handleQuickLogin('CUSTOMER')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              role === 'CUSTOMER'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('THEATRE_ADMIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              role === 'THEATRE_ADMIN'
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Theatre</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('SUPER_ADMIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              role === 'SUPER_ADMIN'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-theme-muted font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted font-bold focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-theme-muted font-bold">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-pink-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-xl text-theme-primary placeholder:text-theme-muted font-bold focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black uppercase tracking-wider shadow-glow-pink transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : role === 'THEATRE_ADMIN' ? 'Sign In to Exhibitor Portal' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--theme-border)] text-center text-xs text-theme-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-500 font-black hover:underline">
            Register Here (Customer & Theatre)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
