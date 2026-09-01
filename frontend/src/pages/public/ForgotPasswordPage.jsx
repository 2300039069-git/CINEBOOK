import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Clock, RotateCcw } from 'lucide-react';
import { authApi } from '../../services/authApi';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [emailDelivered, setEmailDelivered] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendSeconds, setResendSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (step === 2 && resendSeconds > 0) {
      timer = setInterval(() => setResendSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendSeconds]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.sendResetOTP(email);
      if (res?.otp) {
        setDevOtp(res.otp);
      }
      setEmailDelivered(res?.email_delivered ?? true);
      setStep(2);
      setResendSeconds(60);
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code received in your email.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyResetOTP({
        email,
        otp,
        new_password: newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cine-surface border border-cine-border rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-cinema flex items-center justify-center shadow-glow-primary mx-auto">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
          </h1>
          <p className="text-xs text-cine-textMuted">
            {step === 1
              ? "Enter your registered email and we'll send a 6-digit reset code to your inbox"
              : `Check your email inbox (${email}) for the 6-digit reset code`}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Password Reset Successfully!</h3>
            <p className="text-xs text-zinc-300">
              Your password has been updated. You can now log in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-cine-primary text-white text-xs font-bold shadow-glow-primary"
            >
              Sign In Now
            </Link>
          </div>
        ) : step === 1 ? (
          /* STEP 1: ENTER EMAIL */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cine-primary hover:bg-cine-primaryHover text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Email...' : 'Send 6-Digit Reset Code to Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP & NEW PASSWORD */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
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

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1 text-center">
                6-Digit Email Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                required
                autoFocus
                className="w-full py-2.5 bg-cine-card border border-cine-border rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-cine-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-textMuted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white placeholder-cine-textMuted text-xs focus:outline-none focus:border-cine-primary"
                />
              </div>
            </div>

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
                  onClick={handleSendOTP}
                  className="text-cine-primary font-bold hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-cine-primary hover:bg-cine-primaryHover disabled:opacity-50 text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Verify OTP & Reset Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-cine-border/50 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
