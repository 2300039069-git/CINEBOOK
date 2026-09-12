import React from 'react';
import { ShieldCheck, Clock, Ticket, Sparkles, Check, Lock, Store, Zap } from 'lucide-react';

const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full bg-surface rounded-3xl p-5 sm:p-8 border border-border/80 shadow-2xl space-y-8 backdrop-blur-md">
      {/* 1. CURVED CINEMA SCREEN AT TOP */}
      <div className="text-center space-y-3 pt-2">
        <div className="relative mx-auto max-w-xl px-6">
          {/* Ambient Screen Glow */}
          <div className="absolute -top-4 inset-x-8 h-12 bg-gold/15 blur-2xl rounded-full pointer-events-none" />
          
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
                <stop offset="0%" stopColor="#F5A623" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#F5A623" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F5A623" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Screen This Way • 4K RGB Laser Silver Screen</span>
        </p>
      </div>

      {/* 2. SEAT STATE LEGEND & EXHIBITOR NOTICE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-elevated/70 border border-border/80 text-xs">
        {/* State Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-surface border border-border"></div>
            <span className="text-text-muted font-medium text-xs">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gold text-background flex items-center justify-center font-bold">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-text-primary font-bold text-xs">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-surface-elevated border border-dashed border-border opacity-40 flex items-center justify-center text-[10px] text-text-muted">
              <Clock className="w-2.5 h-2.5" />
            </div>
            <span className="text-text-muted font-medium text-xs">Locked / Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-surface-elevated border border-dashed border-border opacity-40 flex items-center justify-center text-[10px] text-text-muted">
              <Lock className="w-2.5 h-2.5" />
            </div>
            <span className="text-text-muted font-medium text-xs">Counter Quota</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gold font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
          <span>Atomic Seat Lock Active</span>
        </div>
      </div>

      {/* 3. CINEMA SEAT TIERS & MATRIX */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[660px] max-w-4xl mx-auto space-y-8">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Price */}
              <div className="flex items-center justify-between pb-2 border-b border-border/70 text-xs">
                <span className="font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <span>{tier.label}</span>
                  {tier.name === 'RECLINER' && (
                    <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-black border border-gold/30">
                      VIP Recliner
                    </span>
                  )}
                </span>
                <span className="text-gold font-black text-sm">
                  ₹{tier.price} <span className="text-text-muted font-normal text-xs">/ seat</span>
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-2 pt-1">
                {tier.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-3">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-bold text-text-muted select-none">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.id === seat.id);
                        const isCounterQuota = seat.status === 'COUNTER_QUOTA' || seat.quota === 'BOX_OFFICE';
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED' && !isSelected;
                        const isDisabled = isBooked || isLocked || isCounterQuota;

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
                                  ? `${seat.id} — Locked by another customer`
                                  : isBooked
                                  ? `${seat.id} — Sold Out`
                                  : isCounterQuota
                                  ? `${seat.id} — Held for Box Office Counter`
                                  : `${seat.id} — ₹${seat.price}`
                              }
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center select-none ${
                                isSelected
                                  ? 'bg-gold text-background shadow-lg shadow-gold/25 ring-2 ring-gold scale-105 active:scale-95 cursor-pointer z-10 font-black'
                                  : isLocked
                                  ? 'bg-gold/10 border border-gold/30 text-gold cursor-not-allowed opacity-60'
                                  : isBooked
                                  ? 'bg-surface-elevated border border-dashed border-border opacity-25 cursor-not-allowed text-text-muted'
                                  : isCounterQuota
                                  ? 'bg-surface-elevated border border-dashed border-border opacity-35 cursor-not-allowed text-text-muted'
                                  : 'bg-surface-elevated border border-border/80 hover:border-gold hover:text-gold text-text-primary hover:scale-105 active:scale-95 cursor-pointer shadow-xs'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : isLocked ? (
                                <Clock className="w-3.5 h-3.5 text-gold" />
                              ) : isCounterQuota ? (
                                <Lock className="w-3 h-3 text-text-muted" />
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
                    <span className="w-5 text-center text-xs font-bold text-text-muted select-none">
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
