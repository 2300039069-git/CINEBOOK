import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Film, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const LoginModal = ({ isOpen, onClose, onSuccess, initialMode = 'login', message }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(`Welcome back! You're now signed in.`);
      } else {
        await register({ name, email, password, phone, role: 'CUSTOMER' });
        toast.success(`Account created successfully! Enjoy booking.`);
      }
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoCustomer = async () => {
    setLoading(true);
    try {
      await login('aarav.sharma@example.com', 'password123');
      toast.success('Signed in as demo customer Aarav Sharma');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={mode === 'login' ? 'Sign in to CINEBOOK' : 'Create an Account'}
      subtitle={
        message ||
        (mode === 'login'
          ? 'Sign in to reserve seats and complete your instant ticket booking'
          : 'Join CINEBOOK to unlock 1-click booking, seat locks, and movie passes')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-surface-elevated border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface-elevated border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none"
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-surface-elevated border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-elevated border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {mode === 'login' ? 'Sign In to Continue' : 'Create Account & Book'}
        </Button>

        {/* Quick Demo Access */}
        <div className="pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={handleQuickDemoCustomer}
            className="w-full py-2 px-3 rounded-lg bg-surface-elevated/80 hover:bg-surface-elevated text-xs font-medium text-text-secondary hover:text-text-primary border border-border flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>1-Click Demo Login (Aarav Sharma)</span>
          </button>
        </div>

        {/* Switch Mode Toggle */}
        <div className="text-center pt-2 text-xs text-text-secondary">
          {mode === 'login' ? (
            <span>
              New to CINEBOOK?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-primary hover:underline"
              >
                Sign up now
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
};
