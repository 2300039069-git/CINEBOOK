import React from 'react';
import { ShieldCheck, Clock, Ticket, Sparkles, Check, Lock, Store } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-10 border border-border shadow-glass-card space-y-8">
      {/* 1. DUAL-QUOTA PROTECTION NOTICE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-gold/10 border border-gold/30 text-xs">
        <div className="flex items-center gap-2.5 text-text-primary">
          <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
          <span>
            <strong className="text-gold">Single-Screen Protection:</strong> Offline Box-Office counter quota is locked for physical window sales.
          </span>
        </div>
        <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-gold/20 text-gold border border-gold/30 flex-shrink-0">
          Dual-Quota Active
        </span>
      </div>

      {/* 2. SEAT STATE LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-6 rounded-2xl glass-panel text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-surface-card border border-gray-700"></div>
          <span className="text-text-secondary font-medium text-[11px]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-accent text-white flex items-center justify-center shadow-cinema-glow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-white font-bold text-[11px]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gray-900 border border-dashed border-gray-800 opacity-40 flex items-center justify-center text-[10px] text-gray-500">
            <Lock className="w-3 h-3" />
          </div>
          <span className="text-text-muted font-medium text-[11px]">Counter Quota</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gray-900 border border-dashed border-gray-800 opacity-40 flex items-center justify-center text-[10px] text-gray-500">
            <Clock className="w-3 h-3" />
          </div>
          <span className="text-text-muted font-medium text-[11px]">Locked / Booked</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[680px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border text-xs">
                <span className="font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <span>{tier.label}</span>
                  {tier.name === 'RECLINER' && (
                    <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-black border border-gold/30">
                      VIP Atmos
                    </span>
                  )}
                </span>
                <span className="text-gold font-bold">
                  ₹{tier.price} <span className="text-text-muted font-normal">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-2.5">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-black text-text-muted">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isCounterQuota = seat.status === 'COUNTER_QUOTA' || seat.quota === 'BOX_OFFICE';
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED';
                        const isDisabled = isBooked || isLocked || isCounterQuota;

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              type="button"
                              disabled={isDisabled}
                              onClick={() => onToggleSeat(seat)}
                              title={
                                isCounterQuota
                                  ? `${seat.id} — Box Office Counter Quota (Held for offline theatre counter)`
                                  : isBooked
                                  ? `${seat.id} (Booked / Sold Out)`
                                  : isLocked
                                  ? `${seat.id} (Temporarily Reserved 8m)`
                                  : `${seat.id} — ₹${seat.price}`
                              }
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'bg-accent text-white shadow-cinema-glow scale-105 cursor-pointer ring-2 ring-accent'
                                  : isDisabled
                                  ? 'bg-gray-900 border border-dashed border-gray-800 opacity-40 cursor-not-allowed text-gray-500'
                                  : 'bg-surface-card border border-gray-700 hover:border-accent text-text-primary hover:scale-105 cursor-pointer'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isCounterQuota ? (
                                <Lock className="w-3 h-3 text-gray-500" />
                              ) : isLocked ? (
                                <Clock className="w-3 h-3 text-gray-500" />
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
                    <span className="w-5 text-center text-xs font-black text-text-muted">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 4. CURVED CINEMA SCREEN WITH SOFT RED DROP-SHADOW */}
          <div className="pt-12 text-center space-y-3">
            <div className="relative mx-auto w-3/4 sm:w-2/3 h-2.5 bg-gradient-to-r from-transparent via-red-500/40 to-transparent rounded-full shadow-cinema-glow" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              All Eyes This Way • 4K Laser Silver Screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
