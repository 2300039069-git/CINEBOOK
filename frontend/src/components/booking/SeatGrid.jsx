import React from 'react';
import { ShieldCheck, Clock, Sparkles } from 'lucide-react';

export const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  return (
    <div className="w-full rounded-3xl bg-[#120F24]/95 border border-[#E5A93C]/35 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(229,169,60,0.2)] p-5 sm:p-8 space-y-8 backdrop-blur-xl transition-colors">
      
      {/* 1. VIOLET-TO-GOLD METALLIC GRADIENT HEADER CARD */}
      <div className="art-deco-header-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5A93C] to-[#FFD066] text-[#0B0A14] flex items-center justify-center font-black shadow-[0_0_12px_rgba(229,169,60,0.4)]">
            5
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white font-display tracking-tight">
              Screen 5, Grand Cinema Complex
            </h2>
            <p className="text-[11px] text-slate-300">
              4K RGB Laser Projection • Dolby Atmos 64-Channel Audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#FFE29A] font-black uppercase text-[10px]">
            Rows A — M (20 Columns)
          </span>
        </div>
      </div>

      {/* 2. CINEMA CURVED TRAPEZOID SCREEN WITH AMBIENT DOWNWARD WHITE/BLUE GLOW */}
      <div className="text-center space-y-3 pt-2">
        <div className="relative mx-auto max-w-xl px-4">
          {/* Curved Trapezoid Arc */}
          <div className="cinema-trapezoid-screen" />
          
          {/* Ambient downward light cone */}
          <div className="w-3/4 mx-auto h-12 bg-gradient-to-b from-blue-200/20 via-blue-400/5 to-transparent blur-md pointer-events-none" />
        </div>

        <div className="flex items-center justify-center gap-2 -mt-4">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD066]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#FFD066] font-display">
            Screen
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            (All eyes this way • Cinema Stage)
          </span>
        </div>
      </div>

      {/* 3. EXACT 3-STATE SEAT LEGEND (Available, Selected, Sold) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0A14]/85 border border-[#E5A93C]/25 text-xs">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {/* Available: Rounded Dark-Gray Square */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-[#1E1B33] border border-[#36305C] shadow-xs flex items-center justify-center text-[9px] font-bold text-slate-400">
              A1
            </div>
            <span className="text-slate-300 font-bold text-xs">Available</span>
          </div>

          {/* Selected: Bright Neon Gold with Outer Glow */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#E5A93C] via-[#FFD066] to-[#FFE29A] text-[#0B0A14] font-black flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(229,169,60,0.55)] border border-[#FFE29A]">
              12
            </div>
            <span className="text-[#FFD066] font-black text-xs">Selected</span>
          </div>

          {/* Sold: Dimmed Gray with an 'X' icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-[#1A1633] border border-slate-700/60 text-[#6E688E] flex items-center justify-center text-xs font-black">
              ✕
            </div>
            <span className="text-slate-400 font-medium text-xs">Sold</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#FFE29A] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#FFD066] shrink-0" />
          <span>Realtime 8-Min Seat Lock</span>
        </div>
      </div>

      {/* 4. SEATING GRID: ROWS A THROUGH M, COLUMNS 1 TO 20 */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[680px] max-w-4xl mx-auto space-y-6">
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-3">
              {/* Tier Header with Golden Accent Price */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5A93C]/25 text-xs">
                <span className="font-black text-white uppercase tracking-wider flex items-center gap-2 font-display">
                  <span>{tier.label || (tier.name === 'BALCONY' ? 'Balcony Class' : 'Second Class')}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E5A93C]/15 text-[#FFE29A] text-[10px] font-black border border-[#E5A93C]/35">
                    Test Rate $14.00 / seat
                  </span>
                </span>
                <span className="text-[#FFD066] font-black text-sm">
                  $14.00 <span className="text-slate-400 font-normal text-xs">/ seat</span>
                </span>
              </div>

              {/* Seating Rows (A to M) */}
              <div className="space-y-2.5 pt-1">
                {tier.rows.map((row) => {
                  const letter = row.rowLetter || row.row_letter;
                  return (
                    <div key={letter} className="flex items-center justify-center gap-3">
                      {/* Row Letter Left */}
                      <span className="w-5 text-center text-xs font-black text-[#FFD066] select-none font-display">
                        {letter}
                      </span>

                      {/* Seats in Row (Columns 1 to 20) */}
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
                                    ? `${seat.id} — Reserved by another user`
                                    : isBooked
                                    ? `${seat.id} — Sold Out`
                                    : `${seat.id} — Available`
                                }
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center select-none relative cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-[#E5A93C] via-[#FFD066] to-[#FFE29A] text-[#0B0A14] shadow-[0_0_15px_rgba(229,169,60,0.55)] border border-[#FFE29A] ring-2 ring-[#FFD066] ring-offset-2 ring-offset-[#0B0A14] scale-110 active:scale-95 z-10 font-black pointer-events-auto'
                                    : isLocked
                                    ? 'bg-[#1A1633] border border-[#E5A93C]/40 text-[#FFD066] cursor-not-allowed pointer-events-none opacity-80'
                                    : isBooked
                                    ? 'bg-[#1A1633] border border-slate-700/50 text-[#6E688E] cursor-not-allowed pointer-events-none font-bold'
                                    : 'bg-[#1E1B33] border border-[#36305C] hover:border-[#FFD066] hover:bg-[#282444] text-slate-200 hover:text-[#FFE29A] hover:shadow-[0_0_10px_rgba(229,169,60,0.3)] hover:scale-105 active:scale-95 pointer-events-auto'
                                }`}
                              >
                                {isSelected ? (
                                  <span className="font-black text-[#0B0A14] text-[11px]">{seat.number}</span>
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
                      <span className="w-5 text-center text-xs font-black text-[#FFD066] select-none font-display">
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
