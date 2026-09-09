import React from 'react';
import { ShieldCheck, Clock, Ticket, Sparkles, Check, Lock, Store } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full bg-[#11141D] rounded-xl p-5 sm:p-8 border border-[#1E2332] shadow-xl space-y-6">
      {/* 1. DUAL-QUOTA PROTECTION NOTICE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-[#181C28] border border-[#1E2332] text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
          <span>
            <strong className="text-white font-semibold">Exhibitor Protection:</strong> Physical box-office counter quota is locked for offline box office sales.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#090A0E] text-[#F59E0B] border border-[#1E2332] flex-shrink-0">
          Dual-Quota Active
        </span>
      </div>

      {/* 2. SEAT STATE LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2.5 px-4 rounded-lg bg-[#090A0E] border border-[#1E2332] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#181C28] border border-slate-600"></div>
          <span className="text-slate-400 font-medium text-xs">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#E50914] text-white flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="text-white font-bold text-xs">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#181C28] border border-dashed border-slate-700 opacity-40 flex items-center justify-center text-[10px] text-slate-500">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <span className="text-slate-400 font-medium text-xs">Counter Quota</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#181C28] border border-dashed border-slate-700 opacity-40 flex items-center justify-center text-[10px] text-slate-500">
            <Clock className="w-2.5 h-2.5" />
          </div>
          <span className="text-slate-400 font-medium text-xs">Locked / Booked</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[640px] max-w-4xl mx-auto space-y-6">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-2.5">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2332] text-xs">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>{tier.label}</span>
                  {tier.name === 'RECLINER' && (
                    <span className="px-2 py-0.5 rounded bg-[#181C28] text-[#F59E0B] text-[9px] font-bold border border-[#1E2332]">
                      VIP Atmos
                    </span>
                  )}
                </span>
                <span className="text-[#F59E0B] font-bold">
                  ₹{tier.price} <span className="text-slate-400 font-normal">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-2">
                    {/* Row Letter Left */}
                    <span className="w-4 text-center text-xs font-bold text-slate-400">
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
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-[11px] font-bold transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#E50914] text-white shadow-sm scale-105 cursor-pointer ring-1 ring-white'
                                  : isDisabled
                                  ? 'bg-[#181C28] border border-dashed border-slate-700 opacity-40 cursor-not-allowed text-slate-400'
                                  : 'bg-[#181C28] border border-slate-600 hover:border-[#E50914] text-white hover:scale-105 cursor-pointer'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : isCounterQuota ? (
                                <Lock className="w-3 h-3 text-slate-400" />
                              ) : isLocked ? (
                                <Clock className="w-3 h-3 text-slate-400" />
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
                    <span className="w-4 text-center text-xs font-bold text-slate-400">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 4. CURVED CINEMA SCREEN */}
          <div className="pt-8 text-center space-y-2">
            <div className="relative mx-auto w-3/4 sm:w-2/3 h-2 bg-gradient-to-r from-transparent via-slate-400 to-transparent rounded-full opacity-60" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
              All Eyes This Way • 4K RGB Laser Silver Screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
