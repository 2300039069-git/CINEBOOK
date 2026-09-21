import React from 'react';
import { ShieldCheck, Clock, Sparkles } from 'lucide-react';
import CinebookSeat3D from './CinebookSeat3D';

export const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full rounded-3xl bg-[#121824]/90 border border-[#E5A93C]/25 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(229,169,60,0.15)] p-5 sm:p-8 space-y-8 backdrop-blur-xl transition-colors">
      
      {/* 1. CURVED CINEMA SCREEN AT TOP WITH GOLDEN NEON LIGHT ARC */}
      <div className="text-center space-y-4 pt-2">
        <div className="relative mx-auto max-w-xl px-6">
          <svg className="w-full h-10 overflow-visible" viewBox="0 0 400 35" fill="none">
            <path
              d="M 10,28 Q 200,5 390,28"
              stroke="url(#screenGoldGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="screenGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#FFD066" stopOpacity="1" />
                <stop offset="100%" stopColor="#E5A93C" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#E5A93C]/10 to-transparent blur-md pointer-events-none" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD066]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#FFD066] font-display">
            Screen
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            (All Eyes This Way • 4K RGB Laser Silver Screen)
          </span>
        </div>
      </div>

      {/* 2. EXACT 3-STATE SEAT LEGEND (Available, Sold, Selected) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1A2234]/80 border border-[#E5A93C]/20 text-xs">
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
          {/* Available: Dark Obsidian */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#121824] border border-[#E5A93C]/40 shadow-xs flex items-center justify-center text-[9px] font-bold text-slate-300">
              A1
            </div>
            <span className="text-slate-300 font-bold text-xs">Available</span>
          </div>

          {/* Sold: Marked with ✕ */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#1A202C] border border-slate-700/60 text-[#64748B] flex items-center justify-center text-xs font-black">
              ✕
            </div>
            <span className="text-slate-400 font-medium text-xs">Sold</span>
          </div>

          {/* Selected: Glowing Neon Gold */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#E5A93C] to-[#FFD066] text-[#0B0E14] font-black flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(229,169,60,0.55)]">
              ✓
            </div>
            <span className="text-[#FFD066] font-black text-xs">Selected</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#FFD066] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#E5A93C] shrink-0" />
          <span>8-Min Realtime Concurrency Lock</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS & ROWS (A THROUGH M / FULL MATRIX) */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[660px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Golden Accent Price */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5A93C]/20 text-xs">
                <span className="font-black text-white uppercase tracking-wider flex items-center gap-2 font-display">
                  <span>{tier.label || (tier.name === 'BALCONY' ? 'Balcony Class' : 'Second Class')}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5A93C]/15 text-[#FFD066] text-[10px] font-black border border-[#E5A93C]/30">
                    Test Rate ₹1 / seat
                  </span>
                </span>
                <span className="text-[#FFD066] font-black text-sm">
                  ₹1 <span className="text-slate-400 font-normal text-xs">/ seat</span>
                </span>
              </div>

              {/* Seating Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => {
                  const letter = row.rowLetter || row.row_letter;
                  return (
                    <div key={letter} className="flex items-center justify-center gap-3">
                      {/* Row Letter Left */}
                      <span className="w-5 text-center text-xs font-extrabold text-[#E5A93C]/80 select-none">
                        {letter}
                      </span>

                      {/* Seats in Row */}
                      <div className="flex items-center gap-2">
                        {row.seats.map((seat) => {
                          const isSelected = selectedSeats.some((s) => s.id === seat.id);
                          const isBooked = seat.status === 'BOOKED';
                          const isLocked = !isSelected && (seat.status === 'LOCKED' || seat.isLockedByOtherTab || seat.isLockedByOther);
                          const isDisabled = isBooked || isLocked;
                          const hasAisle = Boolean(seat.isAisleAfter || seat.is_aisle_after);

                          return (
                            <React.Fragment key={seat.id}>
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => onToggleSeat(seat)}
                                title={
                                  isSelected
                                    ? `${seat.id} — Selected (Click to remove)`
                                    : isLocked
                                    ? `${seat.id} — Seat in progress (Held by another customer)`
                                    : isBooked
                                    ? `${seat.id} — Sold Out`
                                    : `${seat.id} — ₹${seat.price || 1} (Available)`
                                }
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center select-none relative cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-[#E5A93C] to-[#FFD066] text-[#0B0E14] shadow-[0_0_16px_rgba(229,169,60,0.6)] ring-2 ring-[#FFD066] ring-offset-2 ring-offset-[#0B0E14] scale-110 active:scale-95 z-10 font-black pointer-events-auto'
                                    : isLocked
                                    ? 'bg-[#1A202C] border border-[#E5A93C]/40 text-[#FFD066] cursor-not-allowed pointer-events-none opacity-80'
                                    : isBooked
                                    ? 'bg-[#1A202C]/60 border border-slate-700/50 text-[#64748B] cursor-not-allowed pointer-events-none font-bold'
                                    : 'bg-[#121824] border border-[#E5A93C]/25 hover:border-[#E5A93C] hover:bg-[#1A2234] text-slate-200 hover:text-[#FFD066] hover:shadow-[0_0_10px_rgba(229,169,60,0.3)] hover:scale-105 active:scale-95 pointer-events-auto'
                                }`}
                              >
                                {isSelected ? (
                                  <CinebookSeat3D size="md" />
                                ) : isLocked ? (
                                  <Clock className="w-3.5 h-3.5 text-[#FFD066] animate-pulse" />
                                ) : isBooked ? (
                                  '✕'
                                ) : (
                                  seat.number
                                )}
                              </button>
                              {hasAisle && <div className="w-4 sm:w-6" />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Row Letter Right */}
                      <span className="w-5 text-center text-xs font-extrabold text-[#E5A93C]/80 select-none">
                        {letter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
