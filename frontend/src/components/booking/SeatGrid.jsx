import React from 'react';
import { ShieldCheck, Clock, Ticket, Sparkles, Check, Lock, Store } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl space-y-8">
      {/* 1. DUAL-QUOTA PROTECTION NOTICE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-amber-500/[0.06] border border-[#D4AF37]/30 text-xs">
        <div className="flex items-center gap-2.5 text-slate-200">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span>
            <strong className="text-[#D4AF37]">Single-Screen Protection:</strong> Offline Box-Office counter quota is locked for physical window sales.
          </span>
        </div>
        <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex-shrink-0">
          Dual-Quota Active
        </span>
      </div>

      {/* 2. SEAT STATE LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-6 rounded-2xl glass-card text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border border-[#1E293B] bg-[#0F1523]"></div>
          <span className="text-slate-300 font-medium text-[11px]">Available (App)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-[#E50914] to-rose-700 text-white flex items-center justify-center shadow-glow-crimson ring-2 ring-[#FF4B55]">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-white font-black text-[11px]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center text-[10px]">
            <Lock className="w-3 h-3" />
          </div>
          <span className="text-[#D4AF37] font-bold text-[11px]">🔒 Box Office Quota</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center text-[10px] animate-pulse">
            <Clock className="w-3 h-3" />
          </div>
          <span className="text-amber-400 font-bold text-[11px]">Locked (8m)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#080B10] border border-[#1E293B]/60 opacity-30"></div>
          <span className="text-slate-500 line-through text-[11px]">Booked</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[680px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1E293B] text-xs">
                <span className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>{tier.label}</span>
                  {tier.name === 'RECLINER' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black border border-[#D4AF37]/30">
                      VIP Atmos
                    </span>
                  )}
                </span>
                <span className="gradient-text-gold font-black">
                  ₹{tier.price} <span className="text-slate-400 font-normal">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-2.5">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-black text-slate-400">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isCounterQuota = seat.status === 'COUNTER_QUOTA' || seat.quota === 'BOX_OFFICE';
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED';

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              type="button"
                              disabled={isBooked || isLocked || isCounterQuota}
                              onClick={() => onToggleSeat(seat)}
                              title={
                                isCounterQuota
                                  ? `${seat.id} — Box Office Counter Quota (Held for offline theatre ticket window)`
                                  : isBooked
                                  ? `${seat.id} (Booked / Sold Out)`
                                  : isLocked
                                  ? `${seat.id} (Temporarily Reserved 8m)`
                                  : `${seat.id} — ₹${seat.price}`
                              }
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#E50914] to-rose-700 text-white scale-110 shadow-glow-crimson ring-2 ring-[#FF4B55]'
                                  : isCounterQuota
                                  ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] cursor-not-allowed opacity-90'
                                  : isBooked
                                  ? 'bg-[#080B10] border border-[#1E293B]/60 text-slate-600 cursor-not-allowed opacity-30 line-through'
                                  : isLocked
                                  ? 'bg-amber-500/20 border border-amber-500 text-amber-400 cursor-not-allowed animate-pulse'
                                  : 'bg-[#0F1523] border border-[#1E293B] text-slate-200 hover:border-[#D4AF37] hover:scale-105'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isCounterQuota ? (
                                <Lock className="w-3 h-3 text-[#D4AF37]" />
                              ) : isLocked ? (
                                <Clock className="w-3 h-3 text-amber-400" />
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
                    <span className="w-5 text-center text-xs font-black text-slate-400">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 4. CURVED CINEMA SCREEN WITH HOLOGRAPHIC GLOW */}
          <div className="pt-12 text-center space-y-3">
            <div className="relative mx-auto w-3/4 sm:w-2/3 h-2.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-glow-screen opacity-90 animate-pulse" />
            <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center justify-center gap-1.5 font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
              All Eyes This Way • 4K Laser Projection Screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
