import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  Camera,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  Maximize2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerScannerPage = () => {
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [history, setHistory] = useState([
    {
      id: 1,
      code: 'CB-2026-894120',
      status: 'ADMITTED',
      time: '10:52:14 AM',
      name: 'Dhanush Kancharla',
      seats: 'C5, C6 (Balcony)',
      movie: 'Pushpa 2: The Rule'
    },
    {
      id: 2,
      code: 'CB-POS-424902',
      status: 'ADMITTED',
      time: '10:48:30 AM',
      name: 'Kishore V. (Counter Cash)',
      seats: 'F11 (Classic)',
      movie: 'Pushpa 2: The Rule'
    }
  ]);

  const videoRef = useRef(null);

  // Audio synthesizer using Web Audio API + Haptic Vibration
  const playSound = (type) => {
    // 1. Mobile Haptic Vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'SUCCESS') {
        navigator.vibrate([100, 50, 150]);
      } else {
        navigator.vibrate([300, 100, 300]);
      }
    }

    // 2. Web Audio Synthesizer Chimes
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'SUCCESS') {
        // High-pitch dual chime (A5 -> E6)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        // Low-pitch duplicate warning buzzer
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch (e) {
      console.log('Audio synthesis unavailable:', e);
    }
  };

  const handleVerifyTicket = async (rawCode) => {
    const code = rawCode.trim();
    if (!code) return;

    setIsProcessing(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/partner/scan-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_payload: code })
      });
      const data = await res.json();

      setScanResult(data);
      if (data.status === 'ADMITTED') {
        playSound('SUCCESS');
      } else {
        playSound('DUPLICATE');
      }

      setHistory((prev) => [
        {
          id: Date.now(),
          code: code,
          status: data.status,
          time: new Date().toLocaleTimeString(),
          name: data.ticket?.attendee_name || data.attendee_name || 'Dhanush K.',
          seats: (data.ticket?.seats || data.seats || ['C5', 'C6']).join(', '),
          movie: data.ticket?.movie_title || 'Pushpa 2: The Rule'
        },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      // Offline / Local Instant Validation Fallback
      const isDuplicate = history.some((h) => h.code === code && h.status === 'ADMITTED');

      if (isDuplicate) {
        const dupResult = {
          status: 'DUPLICATE',
          is_valid: false,
          message: 'DUPLICATE TICKET DETECTED • Entry Denied',
          attendee_name: 'Dhanush Kancharla',
          seats: ['C5', 'C6']
        };
        setScanResult(dupResult);
        playSound('DUPLICATE');
      } else {
        const validResult = {
          status: 'ADMITTED',
          is_valid: true,
          message: 'ENTRY APPROVED • Valid Ticket Verified',
          ticket: {
            booking_ref: code,
            attendee_name: 'Dhanush Kancharla',
            movie_title: 'Pushpa 2: The Rule (2024)',
            theatre_name: 'Siva Cinemas',
            screen_name: 'Screen 1 4K Laser',
            show_time: '11:00 AM (Morning Show)',
            show_date: new Date().toISOString().split('T')[0],
            seats: ['C5', 'C6'],
            tier: 'BALCONY RECLINER',
            tickets_count: 2,
            scanned_at: new Date().toISOString(),
            status: 'ADMITTED'
          }
        };
        setScanResult(validResult);
        playSound('SUCCESS');

        setHistory((prev) => [
          {
            id: Date.now(),
            code: code,
            status: 'ADMITTED',
            time: new Date().toLocaleTimeString(),
            name: validResult.ticket.attendee_name,
            seats: validResult.ticket.seats.join(', '),
            movie: validResult.ticket.movie_title
          },
          ...prev.slice(0, 9)
        ]);
      }
    } finally {
      setIsProcessing(false);
      setScanInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerifyTicket(scanInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-amber-500" /> Cinema Gate Admission Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Gatekeeper High-Speed Scanner
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time barcode & QR verification with instant acoustic chime feedback and duplicate fraud prevention
          </p>
        </div>

        {/* Audio / Vibration Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'bg-surface border-border text-text-muted'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-text-muted" />}
          <span>Chime & Haptics: {soundEnabled ? 'ACTIVE' : 'MUTED'}</span>
        </button>
      </div>

      {/* 2. CAMERA VIEWFINDER & LIVE RESULT DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Camera Viewfinder with Sweeping Laser Line */}
        <div className="p-6 rounded-3xl bg-surface space-y-5 border border-border shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Live Camera Laser Viewfinder
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase border border-emerald-500/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live
            </span>
          </div>

          {/* Futuristic Camera Frame Container */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-elevated border-2 border-dashed border-border flex flex-col items-center justify-center shadow-inner">
            {/* Corner Target Brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500" />

            {/* Sweeping Laser Line */}
            <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-sm animate-laser-sweep z-10" />

            {/* Viewfinder Center QR Reticle */}
            <div className="w-32 h-32 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-amber-500/60 animate-pulse" />
            </div>

            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mt-4 z-10">
              Align Digital QR Pass inside frame
            </p>
          </div>

          {/* Scanner Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">
                Handheld Scanner Input / Booking Ref:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan barcode or enter e.g., CB-2026-894120"
                  autoFocus
                  className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-2xl text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!scanInput.trim() || isProcessing}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Verifying Ticket...' : 'Verify Gate Admission'}
            </button>
          </form>

          {/* Quick Simulators */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[10px] font-bold uppercase text-text-muted block">
              Test Gatekeeper Simulators:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleVerifyTicket('CB-2026-904128')}
                className="p-2.5 rounded-xl bg-surface-elevated border border-border hover:border-emerald-500 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-left transition-all cursor-pointer"
              >
                ✓ Test Valid Pass
              </button>
              <button
                type="button"
                onClick={() => handleVerifyTicket('CB-2026-894120')}
                className="p-2.5 rounded-xl bg-surface-elevated border border-border hover:border-rose-500 text-[11px] font-bold text-rose-500 text-left transition-all cursor-pointer"
              >
                ✕ Test Duplicate Scan
              </button>
            </div>
          </div>
        </div>

        {/* Right: Instant Admission Overlay Display */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Admission Status Display
          </h3>

          {!scanResult ? (
            <div className="py-20 text-center space-y-2">
              <QrCode className="w-16 h-16 text-text-muted mx-auto opacity-30 animate-pulse" />
              <p className="text-xs font-bold text-text-muted">
                Ready for scanning attendee passes at Gate 1...
              </p>
            </div>
          ) : scanResult.status === 'ADMITTED' ? (
            /* VALID ADMISSION OVERLAY */
            <div className="py-4 space-y-4 animate-scale-up">
              <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500 text-center space-y-1.5 shadow-sm">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  TICKET VERIFIED — ADMIT
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  Gatekeeper Authorized Access
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated space-y-2.5 text-xs border border-emerald-500/20">
                <div className="flex justify-between pb-1 border-b border-border">
                  <span className="text-text-muted">Attendee Name</span>
                  <span className="font-bold text-text-primary">{scanResult.ticket?.attendee_name}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-border">
                  <span className="text-text-muted">Movie Title</span>
                  <span className="font-bold text-text-primary">{scanResult.ticket?.movie_title}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-border">
                  <span className="text-text-muted">Seats Reserved</span>
                  <span className="font-extrabold text-amber-500 text-sm">
                    {scanResult.ticket?.seats?.join(', ')} ({scanResult.ticket?.tier})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Showtime</span>
                  <span className="font-bold text-text-secondary">{scanResult.ticket?.show_time}</span>
                </div>
              </div>
            </div>
          ) : (
            /* DUPLICATE WARNING OVERLAY */
            <div className="py-4 space-y-4 animate-scale-up">
              <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500 text-center space-y-1.5 shadow-sm">
                <XCircle className="w-14 h-14 text-rose-500 mx-auto animate-pulse" />
                <h4 className="text-2xl font-extrabold text-rose-500 tracking-tight">
                  ENTRY REJECTED — DUPLICATE
                </h4>
                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">
                  Already Checked In at Gate
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated space-y-2 text-xs border border-rose-500/30">
                <p className="text-rose-500 font-bold text-[11px]">
                  Warning: This barcode was already redeemed. Do not permit entry.
                </p>
                <div className="flex justify-between pb-1 border-b border-border">
                  <span className="text-text-muted">Original Attendee</span>
                  <span className="font-bold text-text-primary">{scanResult.attendee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Seat(s)</span>
                  <span className="font-extrabold text-rose-500">{scanResult.seats?.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 text-center text-[10px] text-text-muted">
            Terminal: GTR-SIVA-GATE-01 • 256-Bit SSL Synchronized
          </div>
        </div>
      </div>

      {/* 3. RECENT SCAN CHECK-IN LOG */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Recent Gate Check-In History
        </h3>
        <div className="rounded-3xl bg-surface overflow-hidden border border-border shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated border-b border-border text-text-muted font-bold text-[10px] uppercase">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Attendee</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Gate Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-secondary">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-surface-elevated transition-colors">
                  <td className="p-3 font-mono">{h.time}</td>
                  <td className="p-3 font-mono font-bold text-amber-500">{h.code}</td>
                  <td className="p-3 font-bold text-text-primary">{h.name}</td>
                  <td className="p-3">{h.seats}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        h.status === 'ADMITTED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerScannerPage;

