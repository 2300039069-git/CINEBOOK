import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, KeyRound, Clock, RotateCcw, X } from 'lucide-react';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [emailDelivered, setEmailDelivered] = useState(true);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  const { setUserAndToken } = useAuth();
  const navigate = useNavigate();

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (isOtpModalOpen && resendSeconds > 0) {
      timer = setInterval(() => setResendSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, resendSeconds]);

  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendRegistrationOTP(email);
      if (res?.otp) {
        setDevOtp(res.otp);
      }
      setEmailDelivered(res?.email_delivered ?? true);
      setIsOtpModalOpen(true);
      setResendSeconds(60);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyRegistrationOTP({
        name,
        email,
        phone,
        password,
        otp,
        role: 'CUSTOMER'
      });

      if (res?.access_token && res?.user) {
        if (setUserAndToken) {
          setUserAndToken(res.user, res.access_token);
        } else {
          localStorage.setItem('cinebook_token', res.access_token);
          localStorage.setItem('cinebook_user', JSON.stringify(res.user));
        }
      }
      setIsOtpModalOpen(false);
      navigate('/');
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP. Please check your email or use the code above.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendSeconds > 0) return;
    setOtpError('');
    try {
      const res = await authApi.sendRegistrationOTP(email);
      if (res?.otp) {
        setDevOtp(res.otp);
      }
      setEmailDelivered(res?.email_delivered ?? true);
      setResendSeconds(60);
    } catch (err) {
      setOtpError(err.message || 'Failed to resend verification code.');
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
            Create Cine<span className="text-cine-primary">Book</span> Account
          </h1>
          <p className="text-xs text-cine-textMuted">
            A 6-digit verification code will be sent to your email inbox
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleInitiateRegister} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email Address (OTP sent to inbox)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded bg-cine-card border-cine-border text-cine-primary focus:ring-0"
            />
            <label htmlFor="terms" className="text-[11px] text-cine-textMuted">
              I agree to the{' '}
              <Link to="/terms" className="text-white hover:underline">
                Terms of Service
              </Link>{' '}
              &{' '}
              <Link to="/privacy" className="text-white hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cine-primary hover:bg-cine-primaryHover text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Sending Email Code...' : 'Send Verification Code to Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-cine-border/50 text-center text-xs text-cine-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="text-cine-primary font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* --- OTP VERIFICATION MODAL --- */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-cine-surface border border-cine-border rounded-3xl p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cine-border/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cine-primary/10 text-cine-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Check Your Email</h3>
                  <p className="text-xs text-cine-textMuted">Verification code sent to {email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOtpModalOpen(false)}
                className="p-1.5 rounded-lg text-cine-textMuted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Verification Code Card */}
            {devOtp && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cine-primary/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 animate-fade-in shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                      {emailDelivered ? "Instant Verification Code" : "Verification Code (Testing/Fallback)"}
                    </div>
                    <div className="text-base font-mono font-black text-amber-300 tracking-widest">{devOtp}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Auto-fill</span>
                </button>
              </div>
            )}

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2 text-center">
                  Enter 6-Digit Email Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full py-3 bg-cine-card border border-cine-border rounded-2xl text-center text-2xl font-mono tracking-widest text-white placeholder-zinc-600 focus:outline-none focus:border-cine-primary"
                />
              </div>

              {/* Resend OTP Bar */}
              <div className="flex items-center justify-between text-xs text-cine-textMuted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Code expires in 5 mins</span>
                </span>

                {resendSeconds > 0 ? (
                  <span className="text-zinc-500 font-mono">Resend in {resendSeconds}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-cine-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-cine-primary hover:bg-cine-primaryHover disabled:opacity-50 text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying...' : 'Verify Email & Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
