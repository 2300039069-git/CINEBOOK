import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Save,
  Lock,
  Check,
  Building,
  Sparkles,
  Sliders,
  Layers,
  ShieldAlert,
  RotateCcw,
  Zap,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Store,
  Smartphone
} from 'lucide-react';

const INITIAL_LAYOUT = {
  screen_name: 'Screen 1 4K Laser',
  sound_system: 'Dolby Atmos 64-Channel',
  projection: 'Barco 4K RGB Laser',
  total_capacity: 280,
  tiers: [
    {
      id: 'BALCONY',
      name: 'Balcony (Gold Recliner)',
      price: 280,
      rows: [
        { rowLetter: 'A', seatsCount: 14, quotaMode: 'MIXED', counterHeld: [1, 2, 3, 4] },
        { rowLetter: 'B', seatsCount: 14, quotaMode: 'APP', counterHeld: [] }
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Premium Executive',
      price: 200,
      rows: [
        { rowLetter: 'C', seatsCount: 16, quotaMode: 'MIXED', counterHeld: [1, 2, 3] },
        { rowLetter: 'D', seatsCount: 16, quotaMode: 'APP', counterHeld: [] },
        { rowLetter: 'E', seatsCount: 16, quotaMode: 'APP', counterHeld: [] }
      ]
    },
    {
      id: 'EXECUTIVE',
      name: 'Classic Second Class',
      price: 130,
      rows: [
        { rowLetter: 'F', seatsCount: 18, quotaMode: 'MIXED', counterHeld: [1, 2, 3, 4, 5, 6] },
        { rowLetter: 'G', seatsCount: 18, quotaMode: 'APP', counterHeld: [] },
        { rowLetter: 'H', seatsCount: 18, quotaMode: 'COUNTER', counterHeld: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
        { rowLetter: 'J', seatsCount: 18, quotaMode: 'COUNTER', counterHeld: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] }
      ]
    }
  ]
};

const PartnerScreensPage = () => {
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [isAutoReleaseTriggered, setIsAutoReleaseTriggered] = useState(false);
  const [autoReleaseTimer, setAutoReleaseTimer] = useState('15:00');
  const [isSaved, setIsSaved] = useState(false);

  // Toggle individual seat Counter Quota Hold
  const toggleSeatQuota = (tierId, rowLetter, seatNum) => {
    setLayout(prev => {
      const updatedTiers = prev.tiers.map(t => {
        if (t.id !== tierId) return t;
        const updatedRows = t.rows.map(r => {
          if (r.rowLetter !== rowLetter) return r;
          const isHeld = r.counterHeld.includes(seatNum);
          const newHeld = isHeld
            ? r.counterHeld.filter(n => n !== seatNum)
            : [...r.counterHeld, seatNum].sort((a, b) => a - b);
          return {
            ...r,
            counterHeld: newHeld,
            quotaMode: newHeld.length === r.seatsCount ? 'COUNTER' : newHeld.length === 0 ? 'APP' : 'MIXED'
          };
        });
        return { ...t, rows: updatedRows };
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  // Toggle entire row between 100% Online App vs 100% Counter Quota
  const toggleEntireRowQuota = (tierId, rowLetter) => {
    setLayout(prev => {
      const updatedTiers = prev.tiers.map(t => {
        if (t.id !== tierId) return t;
        const updatedRows = t.rows.map(r => {
          if (r.rowLetter !== rowLetter) return r;
          const isCurrentlyAllCounter = r.counterHeld.length === r.seatsCount;
          const newHeld = isCurrentlyAllCounter ? [] : Array.from({ length: r.seatsCount }, (_, i) => i + 1);
          return {
            ...r,
            counterHeld: newHeld,
            quotaMode: newHeld.length === r.seatsCount ? 'COUNTER' : 'APP'
          };
        });
        return { ...t, rows: updatedRows };
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  // Quick Preset: 80% Online / 20% Box Office
  const apply8020Preset = () => {
    setLayout(prev => {
      const updatedTiers = prev.tiers.map(t => {
        const updatedRows = t.rows.map(r => {
          if (r.rowLetter === 'H' || r.rowLetter === 'J') {
            return {
              ...r,
              counterHeld: Array.from({ length: r.seatsCount }, (_, i) => i + 1),
              quotaMode: 'COUNTER'
            };
          }
          if (r.rowLetter === 'A') {
            return { ...r, counterHeld: [1, 2, 3, 4], quotaMode: 'MIXED' };
          }
          return { ...r, counterHeld: [], quotaMode: 'APP' };
        });
        return { ...t, rows: updatedRows };
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  // Simulate 30-Minute Auto-Release Safeguard
  const handleSimulateAutoRelease = () => {
    setIsAutoReleaseTriggered(true);
    setLayout(prev => {
      const updatedTiers = prev.tiers.map(t => ({
        ...t,
        rows: t.rows.map(r => ({
          ...r,
          counterHeld: Array.from({ length: r.seatsCount }, (_, i) => i + 1), // All unsold app seats converted to counter
          quotaMode: 'COUNTER'
        }))
      }));
      return { ...prev, tiers: updatedTiers };
    });
    setTimeout(() => {
      alert('⚡ 30-Minute Auto-Release Complete: All unsold online inventory is now released and ready for cash counter walk-ins!');
    }, 400);
  };

  const handleSaveLayout = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Total seat calculations
  const totalPhysicalSeats = layout.tiers.reduce((acc, t) => acc + t.rows.reduce((rAcc, r) => rAcc + r.seatsCount, 0), 0);
  const totalCounterHeld = layout.tiers.reduce((acc, t) => acc + t.rows.reduce((rAcc, r) => rAcc + r.counterHeld.length, 0), 0);
  const totalOnlineApp = totalPhysicalSeats - totalCounterHeld;

  return (
    <div className="space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <Grid3X3 className="w-4 h-4 text-amber-500" /> Theatre Floor & Quota Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Interactive Seating Layout & Dual-Quota Allocator
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Click rows or individual seats to partition capacity between <strong>Online App</strong> and <strong>Box-Office Counter</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={apply8020Preset}
            className="px-4 py-2.5 rounded-2xl bg-surface border border-border hover:border-amber-500 text-xs font-bold text-text-primary transition-all cursor-pointer"
          >
            ⚡ Apply 80/20 Quota Preset
          </button>

          <button
            type="button"
            onClick={handleSaveLayout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow-sm transition-all transform hover:scale-105 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Quota Saved ✓' : 'Save Quota Policy'}</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT 30-MINUTE AUTO-RELEASE SAFEGUARD BANNER */}
      <div className="p-5 rounded-3xl bg-surface border border-amber-500/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 flex-shrink-0 animate-pulse">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-500/20">
                Guaranteed Full House Safeguard
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Engine Active
              </span>
            </div>
            <h3 className="text-base font-bold text-text-primary">
              ⚡ Unsold Online Seats Auto-Release to Counter 30 Mins Before Showtime
            </h3>
            <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
              If online users have not purchased app quota seats 30 minutes before screening starts, the system automatically unblocks and converts them into offline Box-Office counter inventory.
            </p>
          </div>
        </div>

        {/* Live Simulation Trigger Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="px-4 py-2 rounded-2xl bg-surface-elevated border border-border text-center sm:text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-text-muted block">Next Release Window</span>
            <span className="text-sm font-extrabold text-amber-500 font-mono">T-30:00 (15m left)</span>
          </div>

          <button
            type="button"
            onClick={handleSimulateAutoRelease}
            disabled={isAutoReleaseTriggered}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isAutoReleaseTriggered
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-accent hover:bg-accent-hover text-white shadow-sm transform hover:scale-102'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAutoReleaseTriggered ? 'Auto-Released to Counter ✓' : 'Simulate 30-Min Release Now'}</span>
          </button>
        </div>
      </div>

      {/* 3. QUOTA METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Seats */}
        <div className="p-5 rounded-3xl bg-surface space-y-1 border border-border shadow-sm">
          <span className="text-xs font-bold uppercase text-text-muted">Physical Capacity</span>
          <h3 className="text-2xl font-extrabold text-text-primary">{totalPhysicalSeats} Total Seats</h3>
          <p className="text-[11px] text-text-muted">Auditorium Screen 1</p>
        </div>

        {/* Online App Quota */}
        <div className="p-5 rounded-3xl bg-surface space-y-1 border border-cyan-500/30 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Online App Quota
            </span>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{Math.round((totalOnlineApp / totalPhysicalSeats) * 100)}%</span>
          </div>
          <h3 className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{totalOnlineApp} Seats Open</h3>
          <p className="text-[11px] text-text-muted">Available on CineBook Consumer App</p>
        </div>

        {/* Box-Office Counter Quota */}
        <div className="p-5 rounded-3xl bg-surface space-y-1 border border-amber-500/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-500 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Box-Office Counter Quota
            </span>
            <span className="text-xs font-bold text-amber-500">{Math.round((totalCounterHeld / totalPhysicalSeats) * 100)}%</span>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-500">{totalCounterHeld} Seats Held</h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Strictly reserved for physical window cash sales</p>
        </div>
      </div>

      {/* 4. INTERACTIVE VISUAL SEAT MATRIX ALLOCATOR */}
      <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border shadow-xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border text-xs">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-text-primary">Screen 1 Floor Layout</h3>
            <p className="text-text-muted text-xs">
              Click any <strong className="text-text-primary">Row Letter</strong> on the left to toggle entire row, or click individual seats.
            </p>
          </div>

          {/* Interactive Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-surface-elevated border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px]">
                📱
              </div>
              <span className="text-text-secondary font-medium">Online App Quota</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-500 flex items-center justify-center text-[10px]">
                🔒
              </div>
              <span className="text-amber-500 font-bold">Box-Office Locked</span>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] max-w-4xl mx-auto space-y-8">
            {layout.tiers.map((tier) => (
              <div key={tier.id} className="space-y-3">
                {/* Tier Title */}
                <div className="flex items-center justify-between pb-1.5 border-b border-border text-xs">
                  <span className="font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    {tier.name}
                  </span>
                  <span className="text-amber-500 font-bold">
                    Default Base: ₹{tier.price} / ticket
                  </span>
                </div>

                {/* Rows & Seats */}
                <div className="space-y-2 pt-1">
                  {tier.rows.map((row) => {
                    const isAllCounter = row.counterHeld.length === row.seatsCount;
                    const isAllApp = row.counterHeld.length === 0;

                    return (
                      <div key={row.rowLetter} className="flex items-center justify-center gap-3">
                        {/* Interactive Row Toggle Button (Left) */}
                        <button
                          type="button"
                          onClick={() => toggleEntireRowQuota(tier.id, row.rowLetter)}
                          title={`Click to toggle all seats in Row ${row.rowLetter} (${isAllCounter ? 'Switch to Online App' : 'Switch to Box-Office Locked'})`}
                          className={`w-9 h-7 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                            isAllCounter
                              ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-sm'
                              : isAllApp
                              ? 'bg-surface-elevated border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300'
                          }`}
                        >
                          <span>{row.rowLetter}</span>
                          {isAllCounter && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                        </button>

                        {/* Seats in Row */}
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: row.seatsCount }, (_, i) => i + 1).map((seatNum) => {
                            const isCounterHeld = row.counterHeld.includes(seatNum);
                            return (
                              <React.Fragment key={seatNum}>
                                <button
                                  type="button"
                                  onClick={() => toggleSeatQuota(tier.id, row.rowLetter, seatNum)}
                                  title={`Seat ${row.rowLetter}${seatNum} — ${isCounterHeld ? 'Held for Box-Office Counter' : 'Open for Online App'}`}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                    isCounterHeld
                                      ? 'bg-amber-500/20 border border-amber-500 text-amber-500 scale-105'
                                      : 'bg-surface-elevated border border-border text-text-secondary hover:border-cyan-500 hover:scale-105'
                                  }`}
                                >
                                  {isCounterHeld ? <Lock className="w-3 h-3 text-amber-500" /> : seatNum}
                                </button>
                                {seatNum === 4 || seatNum === row.seatsCount - 4 ? (
                                  <div className="w-3 sm:w-5" />
                                ) : null}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Row letter right */}
                        <span className="w-6 text-center text-xs font-bold text-text-muted">
                          {row.rowLetter}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Glowing Screen Arc */}
            <div className="pt-10 text-center space-y-2">
              <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full opacity-90" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Cinema 4K Laser Projection Screen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerScreensPage;

