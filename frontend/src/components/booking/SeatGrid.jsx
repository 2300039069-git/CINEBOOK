import React from 'react';
import { ShieldCheck, Clock, Ticket, Sparkles, Check, Lock } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-10 border border-[var(--theme-border)] shadow-2xl space-y-10">
      {/* 1. SEAT STATE LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-3 px-6 rounded-2xl glass-card text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border border-slate-500 bg-black/10 dark:bg-white/5"></div>
          <span className="text-theme-secondary font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-glow-pink">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-theme-primary font-black">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[10px]">
            <Lock className="w-3 h-3" />
          </div>
          <span className="text-amber-500 font-bold">Locked (5m)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-black/20 dark:bg-white/5 opacity-30 border border-slate-700"></div>
          <span className="text-theme-muted line-through">Booked</span>
        </div>
      </div>

      {/* 2. CINEMA SEAT TIERS */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[680px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--theme-border)] text-xs">
                <span className="font-black text-theme-primary uppercase tracking-wider">
                  {tier.label}
                </span>
                <span className="gradient-text-gold font-black">
                  ₹{tier.price} <span className="text-theme-muted font-normal">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-2.5">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-black text-theme-muted">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED';

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              disabled={isBooked || isLocked}
                              onClick={() => onToggleSeat(seat)}
                              title={
                                isBooked
                                  ? `${seat.id} (Booked)`
                                  : isLocked
                                  ? `${seat.id} (Reserved)`
                                  : `${seat.id} — ₹${seat.price}`
                              }
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110 shadow-glow-pink'
                                  : isBooked
                                  ? 'bg-black/10 dark:bg-white/5 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-30'
                                  : isLocked
                                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-400 cursor-not-allowed'
                                  : 'glass-panel text-theme-primary hover:border-pink-500'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                seat.number
                              )}
                            </button>
                            {seat.isAisleAfter && <div className="w-4 sm:w-6" />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Letter Right */}
                    <span className="w-5 text-center text-xs font-black text-theme-muted">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 3. CURVED CINEMA SCREEN WITH HOLOGRAPHIC GLOW */}
          <div className="pt-12 text-center space-y-3">
            <div className="relative mx-auto w-3/4 sm:w-2/3 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-glow-screen opacity-90 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-widest text-cyan-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              All Eyes This Way • Cinema Screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
