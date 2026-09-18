import React from 'react';
import { ShieldCheck, Clock, Sparkles } from 'lucide-react';
import CinebookSeat3D from './CinebookSeat3D';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-5 sm:p-8 space-y-8 transition-colors">
      {/* 1. CURVED CINEMA SCREEN AT TOP */}
      <div className="text-center space-y-3 pt-2">
        <div className="relative mx-auto max-w-xl px-6">
          {/* Curved Screen SVG / Gradient Bar */}
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 400 30" fill="none">
            <path
              d="M 10,25 Q 200,5 390,25"
              stroke="url(#screenGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E50914" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#E50914" stopOpacity="1" />
                <stop offset="100%" stopColor="#E50914" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Screen This Way • 4K RGB Laser Silver Screen</span>
        </p>
      </div>

      {/* 2. SEAT STATE LEGEND */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
        {/* State Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-white dark:bg-slate-800 border border-emerald-500/50 shadow-xs"></div>
            <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center shadow-xs">
              <CinebookSeat3D size="xs" />
            </div>
            <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-amber-500/20 border border-amber-500 text-amber-500 flex items-center justify-center text-[10px]">
              <Clock className="w-2.5 h-2.5" />
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">Locked (Seat in progress)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-rose-500/10 dark:bg-slate-900 border border-rose-500/30 opacity-60 flex items-center justify-center text-[10px] text-rose-500">
              ✕
            </div>
            <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">Sold Out</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span>Realtime Seat Lock Active</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS & MATRIX */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[660px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span>{tier.label || (tier.name === 'BALCONY' ? 'Balcony Class' : 'Second Class')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/30">
                    Test Rate ₹1 / seat
                  </span>
                </span>
                <span className="text-primary font-black text-sm">
                  ₹1 <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-3">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = !isSelected && (seat.status === 'LOCKED' || seat.isLockedByOtherTab || seat.isLockedByOther);
                        const isDisabled = isBooked || isLocked;

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
                                  : `${seat.id} — ₹${seat.price} (Available)`
                              }
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center select-none relative ${
                                isSelected
                                  ? 'bg-gradient-to-br from-primary to-red-700 text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-1 ring-offset-white dark:ring-offset-[#161B26] scale-110 active:scale-95 cursor-pointer z-10 font-black pointer-events-auto'
                                  : isLocked
                                  ? 'bg-amber-500/20 dark:bg-amber-500/25 border border-amber-500 text-amber-500 dark:text-amber-400 cursor-not-allowed pointer-events-none opacity-90 shadow-xs'
                                  : isBooked
                                  ? 'bg-rose-500/10 dark:bg-slate-900 border border-rose-500/30 dark:border-slate-800 opacity-40 cursor-not-allowed pointer-events-none text-rose-500 dark:text-slate-500 line-through'
                                  : 'bg-white dark:bg-slate-800/80 border border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-100 hover:text-emerald-600 hover:scale-105 active:scale-95 cursor-pointer shadow-xs pointer-events-auto'
                              }`}
                            >
                              {isSelected ? (
                                <CinebookSeat3D size="md" />
                              ) : isLocked ? (
                                <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                              ) : isBooked ? (
                                '✕'
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
                    <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
