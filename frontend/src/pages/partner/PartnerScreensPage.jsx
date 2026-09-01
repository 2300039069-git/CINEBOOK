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
  RotateCcw
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
      color: 'amber',
      rows: [
        { rowLetter: 'A', seatsCount: 14, counterHeld: [1, 2] },
        { rowLetter: 'B', seatsCount: 14, counterHeld: [] }
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Premium Executive',
      price: 200,
      color: 'pink',
      rows: [
        { rowLetter: 'C', seatsCount: 16, counterHeld: [1, 2, 3] },
        { rowLetter: 'D', seatsCount: 16, counterHeld: [1, 2, 3] },
        { rowLetter: 'E', seatsCount: 16, counterHeld: [] }
      ]
    },
    {
      id: 'EXECUTIVE',
      name: 'Classic Second Class',
      price: 130,
      color: 'cyan',
      rows: [
        { rowLetter: 'F', seatsCount: 18, counterHeld: [1, 2, 3, 4] },
        { rowLetter: 'G', seatsCount: 18, counterHeld: [1, 2, 3, 4] },
        { rowLetter: 'H', seatsCount: 18, counterHeld: [] },
        { rowLetter: 'J', seatsCount: 18, counterHeld: [] }
      ]
    }
  ]
};

const PartnerScreensPage = () => {
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [activeTool, setActiveTool] = useState('COUNTER_HOLD'); // COUNTER_HOLD, EDIT_TIER, INSPECT
  const [selectedSeatDetails, setSelectedSeatDetails] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Toggle seat Counter Quota Hold
  const toggleCounterHold = (tierId, rowLetter, seatNum) => {
    setLayout(prev => {
      const updatedTiers = prev.tiers.map(t => {
        if (t.id !== tierId) return t;
        const updatedRows = t.rows.map(r => {
          if (r.rowLetter !== rowLetter) return r;
          const isHeld = r.counterHeld.includes(seatNum);
          const newHeld = isHeld
            ? r.counterHeld.filter(n => n !== seatNum)
            : [...r.counterHeld, seatNum].sort((a, b) => a - b);
          return { ...r, counterHeld: newHeld };
        });
        return { ...t, rows: updatedRows };
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleSaveLayout = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Calculate total counter quota seats held
  const totalCounterHeld = layout.tiers.reduce(
    (acc, t) => acc + t.rows.reduce((rAcc, r) => rAcc + r.counterHeld.length, 0),
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
            <Grid3X3 className="w-4 h-4" /> Hall & Seating Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mt-1 font-display">
            Screen 1 Layout & Counter Quota Builder
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Click seats below to block or unblock physical cash box-office counter quotas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveLayout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Layout Saved ✓' : 'Save Hall Layout'}</span>
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE TOOLBAR & AUDI SPECS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Screen Specs Box */}
        <div className="p-5 rounded-3xl glass-panel space-y-3">
          <h3 className="text-xs font-black uppercase text-pink-500 tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4" /> Screen Technical Specs
          </h3>
          <div className="space-y-2 text-xs text-theme-secondary">
            <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
              <span className="text-theme-muted">Screen Name</span>
              <span className="font-bold text-theme-primary">{layout.screen_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
              <span className="text-theme-muted">Sound Audio</span>
              <span className="font-bold text-theme-primary">{layout.sound_system}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
              <span className="text-theme-muted">Projection</span>
              <span className="font-bold text-theme-primary">{layout.projection}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-theme-muted">Total Capacity</span>
              <span className="font-black text-theme-primary">{layout.total_capacity} Physical Seats</span>
            </div>
          </div>
        </div>

        {/* Counter Quota Hold Summary */}
        <div className="p-5 rounded-3xl glass-panel space-y-3">
          <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> Box-Office Counter Quota
          </h3>
          <div className="space-y-1">
            <h4 className="text-2xl font-black gradient-text-gold">{totalCounterHeld} Seats Held</h4>
            <p className="text-xs text-theme-muted">
              These seats are blocked from online booking and reserved strictly for in-person cash ticket counters.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[8px]">
              🔒
            </span>
            <span className="text-[11px] text-amber-400 font-bold">Counter Block Active</span>
          </div>
        </div>

        {/* Legend Guide */}
        <div className="p-5 rounded-3xl glass-panel space-y-3">
          <h3 className="text-xs font-black uppercase text-cyan-500 tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4" /> Seating Legend
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg glass-panel border border-[var(--theme-border)]" />
              <span className="text-theme-secondary font-medium">Available for Online Booking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[10px]">
                🔒
              </div>
              <span className="text-amber-400 font-bold">Held for Box-Office Cash Counter</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </div>
              <span className="text-pink-500 font-bold">Booked / Occupied Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE VISUAL SEAT MATRIX BUILDER */}
      <div className="p-6 sm:p-10 rounded-3xl glass-panel border border-[var(--theme-border)] shadow-2xl space-y-8">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] max-w-4xl mx-auto space-y-8">
            {layout.tiers.map((tier) => (
              <div key={tier.id} className="space-y-3">
                {/* Tier Title & Price */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[var(--theme-border)] text-xs">
                  <span className="font-black uppercase tracking-wider text-theme-primary">
                    {tier.name}
                  </span>
                  <span className="gradient-text-gold font-black">
                    Default Base: ₹{tier.price} / ticket
                  </span>
                </div>

                {/* Rows & Seats */}
                <div className="space-y-2 pt-1">
                  {tier.rows.map((row) => (
                    <div key={row.rowLetter} className="flex items-center justify-center gap-3">
                      <span className="w-6 text-center text-xs font-black text-theme-muted">
                        {row.rowLetter}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: row.seatsCount }, (_, i) => i + 1).map((seatNum) => {
                          const isCounterHeld = row.counterHeld.includes(seatNum);
                          return (
                            <React.Fragment key={seatNum}>
                              <button
                                onClick={() => toggleCounterHold(tier.id, row.rowLetter, seatNum)}
                                title={`Seat ${row.rowLetter}${seatNum} — Click to toggle Counter Quota Hold`}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center ${
                                  isCounterHeld
                                    ? 'bg-amber-500/20 border border-amber-500 text-amber-400 scale-105 shadow-sm'
                                    : 'glass-panel text-theme-primary hover:border-pink-500 hover:scale-105'
                                }`}
                              >
                                {isCounterHeld ? '🔒' : seatNum}
                              </button>
                              {seatNum === 4 || seatNum === row.seatsCount - 4 ? (
                                <div className="w-3 sm:w-5" />
                              ) : null}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <span className="w-6 text-center text-xs font-black text-theme-muted">
                        {row.rowLetter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Glowing Screen Arc */}
            <div className="pt-10 text-center space-y-2">
              <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-glow-screen opacity-90 animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-widest text-cyan-500 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                Cinema 4K Curved Silver Screen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerScreensPage;
