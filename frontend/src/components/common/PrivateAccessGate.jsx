import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, KeyRound, ArrowRight, ShieldCheck, Film } from 'lucide-react';

const PASSCODE = '2026'; // Changeable private passcode

const PrivateAccessGate = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cinebook_vip_unlocked');
    if (saved === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (inputCode === PASSCODE || inputCode === 'CineBook@2026' || inputCode === '2026') {
      localStorage.setItem('cinebook_vip_unlocked', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect private access passcode. Please try again.');
    }
  };

  if (isUnlocked) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 p-8 rounded-3xl bg-surface/90 border border-border backdrop-blur-2xl shadow-2xl space-y-6 text-center animate-fade-in">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-gold to-amber-500 p-[2px] mx-auto shadow-gold-glow">
          <div className="w-full h-full bg-background rounded-[22px] flex items-center justify-center">
            <Lock className="w-7 h-7 text-gold" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Private Beta Preview
          </span>
          <h1 className="text-3xl font-black font-display tracking-tight text-text-primary">
            CINE<span className="text-primary">BOOK</span>
          </h1>
          <p className="text-xs text-text-muted">
            This platform is currently in private preview. Enter the VIP passcode to unlock the application.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              placeholder="Enter Passcode (e.g. 2026)"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface-elevated border border-border text-text-primary placeholder:text-text-muted text-sm font-bold text-center tracking-widest focus:outline-none focus:border-gold transition-all"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-500 animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black text-xs font-black uppercase tracking-wider shadow-gold-glow transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Unlock Preview</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-border text-[11px] text-text-muted flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Exhibitor & Customer Flow Protected • Passcode: <strong className="text-text-primary">2026</strong></span>
        </div>
      </div>
    </div>
  );
};

export default PrivateAccessGate;
