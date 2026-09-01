import React, { useState } from 'react';
import { X, Lock, Check, Ticket, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_TIERS = [
  { name: 'BALCONY', label: 'BALCONY (GOLD)', price: 280, color: 'text-amber-400 bg-amber-400', rows: ['A', 'B'] },
  { name: 'PREMIUM', label: 'PREMIUM EXECUTIVE', price: 200, color: 'text-pink-400 bg-pink-400', rows: ['C', 'D', 'E'] },
  { name: 'EXECUTIVE', label: 'CLASSIC FIRST CLASS', price: 130, color: 'text-cyan-400 bg-cyan-400', rows: ['F', 'G', 'H', 'J'] }
];

const SeatSelectionModal = ({
  isOpen,
  onClose,
  movie = {
    title: 'Pushpa 2: The Rule (2024)',
    censor: 'UA 16+',
    language: 'Telugu • Hindi',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'
  },
  theatreName = 'Siva Cinemas',
  selectedTime = '11:00 AM'
}) => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([
    { id: 'C7', tier: 'PREMIUM', price: 200 },
    { id: 'C8', tier: 'PREMIUM', price: 200 }
  ]);

  if (!isOpen) return null;

  const toggleSeat = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;

    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalAmount = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat.');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#111322] border border-pink-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* 1. MODAL HEADER with Movie Thumbnail & Tier Pricing Legend */}
        <div className="p-4 sm:p-6 bg-[#080914] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Movie Thumbnail & Info */}
          <div className="flex items-center gap-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-12 h-16 rounded-xl object-cover border border-white/20 shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{movie.title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-black">
                  {movie.censor || 'UA'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {theatreName} • <span className="text-cyan-400 font-black">{selectedTime}</span>
              </p>
            </div>
          </div>

          {/* Tier Pricing Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-amber-400/30">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="text-slate-300 font-bold">BALCONY <strong className="text-amber-300">₹280</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-pink-400/30">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />
              <span className="text-slate-300 font-bold">PREMIUM <strong className="text-pink-300">₹200</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-cyan-400/30">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
              <span className="text-slate-300 font-bold">CLASSIC <strong className="text-cyan-300">₹130</strong></span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SEAT MATRIX GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#0D0F1F]">
          {/* Seat Status Legend Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-2 px-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border border-slate-600 bg-white/5" />
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-glow-pink">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-white font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Lock className="w-3 h-3" />
              </div>
              <span className="text-amber-400">Locked (5m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/5 opacity-30" />
              <span className="text-slate-500 line-through">Booked</span>
            </div>
          </div>

          {/* Tier Seating Rows */}
          <div className="space-y-6 max-w-2xl mx-auto overflow-x-auto pb-4">
            {DEFAULT_TIERS.map((tier) => (
              <div key={tier.name} className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/10">
                  <span className="font-black uppercase tracking-wider text-white">{tier.label}</span>
                  <span className="font-black text-amber-400">₹{tier.price}</span>
                </div>

                <div className="space-y-2 pt-1">
                  {tier.rows.map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center justify-center gap-2">
                      <span className="w-4 text-xs font-bold text-slate-500 text-center">{rowLetter}</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                          const seatId = `${rowLetter}${num}`;
                          const isSelected = selectedSeats.some(s => s.id === seatId);
                          const isBooked = (rowLetter === 'D' && (num === 4 || num === 5 || num === 6)) ||
                                           (rowLetter === 'A' && (num === 1 || num === 2)) ||
                                           (rowLetter === 'H' && (num === 9 || num === 10));
                          const isLocked = (rowLetter === 'E' && (num === 7 || num === 8));
                          const seatObj = { id: seatId, tier: tier.name, price: tier.price, status: isBooked ? 'BOOKED' : isLocked ? 'LOCKED' : 'AVAILABLE' };

                          return (
                            <React.Fragment key={seatId}>
                              <button
                                disabled={isBooked || isLocked}
                                onClick={() => toggleSeat(seatObj)}
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-pink scale-110'
                                    : isBooked
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed opacity-30 border border-white/5'
                                    : isLocked
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-white/15 border border-white/15 hover:border-pink-500 text-slate-200'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : isLocked ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  num
                                )}
                              </button>
                              {num === 3 || num === 9 ? <div className="w-3 sm:w-5" /> : null}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <span className="w-4 text-xs font-bold text-slate-500 text-center">{rowLetter}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Glowing Futuristic Holographic Screen */}
            <div className="pt-8 text-center space-y-2">
              <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-glow-screen opacity-90 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                All Eyes This Way • Cinema Screen
              </p>
            </div>
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="p-4 sm:p-6 bg-[#080914] border-t border-white/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Seats Selected</span>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white">
                {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : 'None'}
              </span>
              <span className="text-xs text-slate-400">({selectedSeats.length} Tickets)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Payable</span>
              <span className="text-lg sm:text-2xl font-black gradient-text-neon">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-6 sm:px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                selectedSeats.length > 0
                  ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-glow-pink transform hover:scale-105'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Confirm & Pay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;
