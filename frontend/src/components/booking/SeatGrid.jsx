import React from 'react';

export const SeatGrid = ({
  seatLayout = [],
  selectedSeats = [],
  onToggleSeat
}) => {
  // Column numbers for the header/footer row matching mockup
  const colNumbers = [1, 2, 3, 4, 5, 10, 12, 14, 16, 20];

  return (
    <div className="w-full max-w-lg mx-auto bg-[#171b34] text-white p-3 sm:p-5 space-y-5 select-none">
      
      {/* 1. PURPLE TO GOLD GRADIENT HEADER BANNER (Screen 3 Mockup) */}
      <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7c5cc4] via-[#9e743a] to-[#e0b45c] text-center shadow-lg">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-display drop-shadow-md">
          Screen 5, Grand Cinema Complex
        </h2>
      </div>

      {/* 2. EXACT 3-STATE LEGEND (Available, Selected, Sold) */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs text-[#a8adc9] pt-1">
        {/* Available: #4a4f74 square */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#4a4f74] border border-white/10" />
          <span>Available</span>
        </div>

        {/* Selected: #e0b45c gold square */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#e0b45c] shadow-[0_0_8px_rgba(224,180,92,0.8)]" />
          <span className="text-white font-medium">Selected</span>
        </div>

        {/* Sold: #33374f with ✕ mark */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#33374f] text-[9px] text-[#6b7094] flex items-center justify-center font-bold">
            ✕
          </span>
          <span>Sold</span>
        </div>
      </div>

      {/* 3. CURVED "SCREEN" ARC GRAPHIC (Screen 3 Mockup) */}
      <div className="text-center space-y-1.5 pt-2">
        <div className="relative mx-auto max-w-sm px-4">
          <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-[#7c5cc4]/80 to-transparent rounded-full blur-[0.5px]" />
          <div className="w-3/4 mx-auto h-1.5 bg-[#a8adc9]/40 rounded-full mt-0.5" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a8adc9] block">
          Screen
        </span>
      </div>

      {/* 4. SEAT MAP GRID */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[320px] max-w-md mx-auto space-y-2">
          
          {/* Top Column Numbers */}
          <div className="flex items-center justify-center gap-2 px-6 text-[10px] text-[#6b7094] font-semibold">
            <span className="w-4 text-center" />
            <div className="flex items-center justify-between flex-1 px-1">
              {colNumbers.map((num) => (
                <span key={num} className="w-5 text-center">{num}</span>
              ))}
            </div>
            <span className="w-4 text-center" />
          </div>

          {/* Rows */}
          {seatLayout.map((tier) => (
            <div key={tier.name} className="space-y-1.5">
              {tier.rows.map((row) => {
                const letter = row.rowLetter || row.row_letter;
                return (
                  <div key={letter} className="flex items-center justify-center gap-2">
                    {/* Left Row Letter */}
                    <span className="w-4 text-center text-xs font-semibold text-[#6b7094]">
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
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#33374f] text-[#6b7094] flex items-center justify-center text-[10px] font-bold cursor-not-allowed"
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
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#e0b45c] text-[#171b34] font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-[0_0_12px_rgba(224,180,92,0.7)] cursor-pointer scale-105"
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
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#4a4f74] hover:bg-[#5c6391] border border-white/10 text-transparent hover:text-white/80 text-[8px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Row Letter */}
                    <span className="w-4 text-center text-xs font-semibold text-[#6b7094]">
                      {letter}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Bottom Column Numbers */}
          <div className="flex items-center justify-center gap-2 px-6 text-[10px] text-[#6b7094] font-semibold pt-1">
            <span className="w-4 text-center" />
            <div className="flex items-center justify-between flex-1 px-1">
              {colNumbers.map((num) => (
                <span key={num} className="w-5 text-center">{num}</span>
              ))}
            </div>
            <span className="w-4 text-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
