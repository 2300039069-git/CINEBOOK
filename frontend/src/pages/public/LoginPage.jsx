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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative text-text-primary transition-colors">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mx-auto text-text-primary shadow-lg">
            {role === 'THEATRE_ADMIN' ? (
              <Store className="w-7 h-7 text-amber-500" />
            ) : role === 'SUPER_ADMIN' ? (
              <Shield className="w-7 h-7 text-accent" />
            ) : (
              <Film className="w-7 h-7 text-accent" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-text-primary tracking-tight">
            Sign In to CINE<span className="text-accent">BOOK</span>
          </h1>
          <p className="text-xs text-text-muted">
            {role === 'THEATRE_ADMIN'
              ? 'Access your Exhibitor Dashboard, Screen Layouts & Gate Scanner'
              : role === 'SUPER_ADMIN'
              ? 'Access Super Admin master platform controls'
              : 'Sign in to access your digital tickets & seat bookings'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="p-1.5 bg-surface-elevated border border-border rounded-2xl flex gap-1">
          <button
            type="button"
            onClick={() => handleQuickLogin('CUSTOMER')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'CUSTOMER'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('THEATRE_ADMIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'THEATRE_ADMIN'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Theatre</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('SUPER_ADMIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'SUPER_ADMIN'
                ? 'bg-surface text-text-primary border border-border shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-text-muted font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted font-bold focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-text-muted font-bold">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-amber-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted font-bold focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${
              role === 'THEATRE_ADMIN'
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm font-bold'
                : 'bg-accent hover:bg-accent-hover text-white shadow-sm'
            }`}
          >
            <span>{loading ? 'Authenticating...' : role === 'THEATRE_ADMIN' ? 'Sign In to Exhibitor Portal' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Info */}
        <div className="p-3 rounded-2xl bg-surface-elevated border border-border text-[11px] text-text-muted flex items-center justify-between">
          <span>Click any role tab above to auto-fill demo credentials</span>
          <span className="text-amber-500 font-bold">Demo Ready</span>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border text-center text-xs text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-black hover:underline">
            Register Here (Customer & Theatre)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
