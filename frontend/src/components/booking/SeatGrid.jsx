import React from 'react';

export const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  // Column numbers for the header/footer row matching mockup
  const colNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  return (
    <div className="w-full bg-surface border border-border rounded-3xl p-4 sm:p-8 space-y-6 select-none shadow-2xl transition-colors">
      
      {/* 1. HEADER BANNER */}
      <div className="w-full py-3.5 px-6 rounded-2xl luxury-header-banner text-center shadow-lg">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide font-display drop-shadow-md">
          Screen 5, Grand Cinema Complex • 4K Laser Dolby Atmos
        </h2>
      </div>

      {/* 2. EXACT 3-STATE LEGEND (Available, Selected, Sold) */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-text-secondary pt-1">
        {/* Available */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-state-available border border-border" />
          <span>Available</span>
        </div>

        {/* Selected */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-primary shadow-gold-glow" />
          <span className="text-text-primary font-bold">Selected</span>
        </div>

        {/* Sold */}
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-state-sold text-[10px] text-white flex items-center justify-center font-bold">
            ✕
          </span>
          <span>Sold Out</span>
        </div>
      </div>

      {/* 3. CURVED "SCREEN" ARC GRAPHIC */}
      <div className="text-center space-y-2 pt-2">
        <div className="relative mx-auto max-w-lg px-6">
          <div className="w-full h-3 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full blur-[1px]" />
          <div className="w-4/5 mx-auto h-1.5 bg-text-secondary/50 rounded-full mt-0.5 shadow-[0_0_15px_rgba(124,92,196,0.5)]" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted block">
          All Eyes This Way • Cinema Screen
        </span>
      </div>

      {/* 4. SEAT MAP GRID */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[420px] max-w-2xl mx-auto space-y-2.5">
          
          {/* Top Column Numbers */}
          <div className="flex items-center justify-center gap-2 px-6 text-[10px] text-text-muted font-semibold">
            <span className="w-6 text-center" />
            <div className="flex items-center justify-between flex-1 px-1">
              {colNumbers.map((num) => (
                <span key={num} className="w-6 text-center">{num}</span>
              ))}
            </div>
            <span className="w-6 text-center" />
          </div>

          {/* Rows */}
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-2">
              {tier.name && (
                <div className="pt-2 pb-1 flex items-center justify-between border-b border-border text-[10px] uppercase font-bold text-primary tracking-wider px-2">
                  <span>{tier.name}</span>
                  <span>₹{tier.price || 150}</span>
                </div>
              )}
              {tier.rows.map((row) => {
                const letter = row.rowLetter || row.row_letter;
                return (
                  <div key={letter} className="flex items-center justify-center gap-2">
                    {/* Left Row Letter */}
                    <span className="w-6 text-center text-xs font-bold text-text-muted">
                      {letter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center justify-between flex-1 gap-1">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeats.some(
                          (s) => (s.id || s) === seat.id
                        );
                        const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';

                        if (isBooked) {
                          return (
                            <button
                              key={seat.id}
                              disabled
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-state-sold text-white flex items-center justify-center text-[10px] font-bold cursor-not-allowed"
                            >
                              ✕
                            </button>
                          );
                        }

                        if (isSelected) {
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => onToggleSeat(seat)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary text-[#171b34] font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-gold-glow cursor-pointer scale-110 transition-transform"
                            >
                              {seat.id.replace(/^[A-Z]+/, '') || seat.number}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onToggleSeat(seat)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-state-available hover:bg-primary/30 border border-border text-transparent hover:text-text-primary text-[9px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Row Letter */}
                    <span className="w-6 text-center text-xs font-bold text-text-muted">
                      {letter}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Bottom Column Numbers */}
          <div className="flex items-center justify-center gap-2 px-6 text-[10px] text-text-muted font-semibold pt-2">
            <span className="w-6 text-center" />
            <div className="flex items-center justify-between flex-1 px-1">
              {colNumbers.map((num) => (
                <span key={num} className="w-6 text-center">{num}</span>
              ))}
            </div>
            <span className="w-6 text-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
