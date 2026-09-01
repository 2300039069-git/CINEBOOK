import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Film,
  Clapperboard,
  ArrowRight,
  User,
  Store,
  LogIn,
  UserPlus,
  Play,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CinematicIntro3D = ({ onComplete }) => {
  const [stage, setStage] = useState('INTRO'); // 'INTRO' | 'CHOICE'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  // Synthesize Cinematic Sound Chime
  const playCinematicChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.5);
      osc2.stop(ctx.currentTime + 2.5);
    } catch (e) {
      console.log('Audio synthesis error:', e);
    }
  };

  // Particle canvas animation (Starfield + Projector light beam)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      color: Math.random() > 0.5 ? '#ec4899' : '#06b6d4'
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(7, 7, 9, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Intro progress timer (3 seconds total)
  useEffect(() => {
    playCinematicChime();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('CHOICE');
          return 100;
        }
        return prev + 2;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleSkipToChoice = () => {
    setProgress(100);
    setStage('CHOICE');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070709] text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Dynamic Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* 3D Ambient Projector Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/20 via-pink-500/10 to-transparent blur-[140px] pointer-events-none transform -rotate-12" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-600/20 blur-[130px] pointer-events-none" />

      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white text-xs transition-all"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>

        {stage === 'INTRO' && (
          <button
            onClick={handleSkipToChoice}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Skip 3D Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ----------------- STAGE 1: 3D CINEMATIC ANIMATION ----------------- */}
      {stage === 'INTRO' ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 space-y-8 animate-fade-in">
          {/* 3D Rotating Holographic Cinema Stage */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center perspective-[1200px]">
            {/* Outer 3D Neon Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-pink-500/50 animate-[spin_10s_linear_infinite] shadow-glow-pink" />
            <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-[spin_6s_linear_infinite_reverse]" />

            {/* Floating 3D Cube / Cinema Reel Container */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[2.5px] shadow-2xl transform transition-transform duration-700 animate-pulse hover:scale-110">
              <div className="w-full h-full bg-[#0B0B14] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
                {/* 3D Glowing Film Icon */}
                <Film className="w-14 h-14 sm:w-18 sm:h-18 text-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)] animate-bounce" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-pink-500/20" />
              </div>
            </div>

            {/* Satellite 3D Badges */}
            <span className="absolute -top-2 px-3 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-widest shadow-md animate-pulse">
              4K Laser • Dolby Atmos
            </span>
            <span className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-pink-500/20 border border-pink-500 text-pink-300 text-[10px] font-black uppercase tracking-widest shadow-md">
              Guntur • Vijayawada • Tenali
            </span>
          </div>

          {/* 3D Animated Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight gradient-text-neon drop-shadow-2xl">
              CINEBOOK
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
              Next-Generation Cinema Experience
            </p>
          </div>

          {/* Progress Bar Strip */}
          <div className="w-64 sm:w-80 space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">
              Initializing 3D Cinema Engines • {progress}%
            </p>
          </div>
        </div>
      ) : (
        /* ----------------- STAGE 2: LOGIN / SIGNUP CHOOSER ----------------- */
        <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 animate-scale-up space-y-6 text-center">
          {/* Brand Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[2px] mx-auto shadow-glow-pink">
              <div className="w-full h-full bg-[#0B0B14] rounded-[22px] flex items-center justify-center">
                <Film className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              Welcome to CINE<span className="text-pink-500">BOOK</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Choose an option below to enter your cinema ticketing portal
            </p>
          </div>

          {/* 3 Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* 1. Customer Sign In */}
            <Link
              to="/login"
              onClick={onComplete}
              className="p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-pink-500 hover:scale-103 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 group-hover:scale-110 transition-transform">
                  <LogIn className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-black text-white">Moviegoer Sign In</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Access your digital QR passes, seat reservations & exclusive offers.
              </p>
            </Link>

            {/* 2. Customer Sign Up */}
            <Link
              to="/register"
              onClick={onComplete}
              className="p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-cyan-400 hover:scale-103 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-black text-white">Create Customer Account</h3>
              <p className="text-xs text-zinc-400 mt-1">
                New to CineBook? Sign up in 30 seconds with 1-click email OTP.
              </p>
            </Link>

            {/* 3. Theatre Exhibitor Admin Portal */}
            <Link
              to="/register"
              onClick={onComplete}
              className="p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-amber-400 hover:scale-103 transition-all group relative overflow-hidden sm:col-span-2"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Theatre Partner & Exhibitor Portal
                      <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Code Protected
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Single-screen & Multiplex owners: Sign in or register with your secret authorization code.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>

          {/* Quick Continue as Guest Button */}
          <div className="pt-2">
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-panel hover:border-pink-500 text-xs font-black text-white uppercase tracking-wider transition-all transform hover:scale-105"
            >
              <Compass className="w-4 h-4 text-pink-400" />
              <span>Explore Movies Directly as Guest →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinematicIntro3D;
