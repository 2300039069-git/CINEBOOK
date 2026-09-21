import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { authApi } from '../../services/authApi';
import CinebookLogo from '../../components/common/CinebookLogo';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
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
      await authApi.sendResetOTP(email);
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
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative text-text-primary transition-colors">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative z-10 backdrop-blur-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CinebookLogo size="md" showWordmark={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-display">
            {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
          </h1>
          <p className="text-xs text-text-muted">
            {step === 1
              ? "Enter your registered email and we'll send a 6-digit reset code"
              : `We sent a 6-digit verification code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-text-primary font-sans">Password Reset Successfully!</h3>
            <p className="text-xs text-text-secondary">
              Your password has been updated. You can now log in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta"
            >
              Sign In Now
            </Link>
          </div>
        ) : step === 1 ? (
          /* STEP 1: ENTER EMAIL */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Code...' : 'Send 6-Digit Reset Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP & NEW PASSWORD */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                required
                autoFocus
                className="w-full py-2.5 bg-surface-elevated border border-border rounded-xl text-center text-lg font-mono tracking-widest text-text-primary focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[10px] text-text-muted text-center mt-1">
                Please enter the 6-digit code received on your email
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in 5 mins</span>
              </span>

              {resendSeconds > 0 ? (
                <span className="text-text-muted font-mono">Resend in {resendSeconds}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-cta transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{loading ? 'Updating Password...' : 'Verify Code & Reset Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
