import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, User, Building } from 'lucide-react';
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

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in both email and password.');
      }
      await login(email, password, role);
      navigate(from, { replace: true });
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
      setEmail('theatre@phoenixcinemas.com');
      setPassword('TheatrePass@2026');
    } else {
      setEmail('aarav.sharma@example.com');
      setPassword('CustomerPass@2026');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cine-surface border border-cine-border rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-cinema flex items-center justify-center shadow-glow-primary mx-auto">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Welcome to Cine<span className="text-cine-primary">Book</span>
          </h1>
          <p className="text-xs text-cine-textMuted">
            Sign in to access your digital tickets, admin portal & booking engine
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="p-3 bg-cine-card rounded-2xl border border-cine-border/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cine-textMuted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cine-gold" /> Quick 1-Click Role Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="py-1.5 px-2 rounded-lg bg-cine-surface hover:bg-cine-surface/80 border border-cine-border text-[11px] font-medium text-white transition-colors"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('THEATRE_ADMIN')}
              className="py-1.5 px-2 rounded-lg bg-cine-surface hover:bg-cine-surface/80 border border-cine-border text-[11px] font-medium text-cine-accent transition-colors"
            >
              Theatre Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('SUPER_ADMIN')}
              className="py-1.5 px-2 rounded-lg bg-cine-surface hover:bg-cine-surface/80 border border-cine-border text-[11px] font-medium text-cine-primary transition-colors"
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-cine-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cine-primary hover:bg-cine-primaryHover text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-cine-border/50 text-center text-xs text-cine-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="text-cine-primary font-bold hover:underline">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
