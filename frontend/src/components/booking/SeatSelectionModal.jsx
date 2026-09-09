import React, { useState } from 'react';
import { X, Lock, Check, Ticket, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_TIERS = [
  { name: 'BALCONY', label: 'BALCONY (GOLD)', price: 280, color: 'text-[#D4AF37]', rows: ['A', 'B'] },
  { name: 'PREMIUM', label: 'PREMIUM EXECUTIVE', price: 200, color: 'text-[#E50914]', rows: ['C', 'D', 'E'] },
  { name: 'EXECUTIVE', label: 'CLASSIC FIRST CLASS', price: 130, color: 'text-slate-300', rows: ['F', 'G', 'H', 'J'] }
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
  theatreName = 'Siva Cinemas 4K Dolby Atmos',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in text-text-primary">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* 1. MODAL HEADER with Movie Thumbnail & Tier Pricing Legend */}
        <div className="p-4 sm:p-6 bg-surface-elevated border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Movie Thumbnail & Info */}
          <div className="flex items-center gap-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-12 h-16 rounded-xl object-cover border border-border shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-text-primary">{movie.title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black">
                  {movie.censor || 'UA'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {theatreName} • <span className="text-gold font-black">{selectedTime}</span>
              </p>
            </div>
          </div>

          {/* Tier Pricing Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-gold/30">
              <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-sm" />
              <span className="text-text-secondary font-bold">BALCONY <strong className="text-gold">₹280</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-primary/30">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
              <span className="text-text-secondary font-bold">PREMIUM <strong className="text-primary">₹200</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted shadow-sm" />
              <span className="text-text-secondary font-bold">CLASSIC <strong className="text-text-primary">₹130</strong></span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SEAT MATRIX GRID */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-background">
          {/* Seat Status Legend Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-2.5 px-4 rounded-2xl bg-surface border border-border text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border border-border bg-surface-elevated" />
              <span className="text-text-muted">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center text-white shadow-cta">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-text-primary font-bold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Lock className="w-3 h-3" />
              </div>
              <span className="text-gold">Locked (8m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-surface-elevated border border-border opacity-40" />
              <span className="text-text-muted line-through">Booked</span>
            </div>
          </div>

          {/* Tier Seating Rows */}
          <div className="space-y-6 max-w-2xl mx-auto overflow-x-auto pb-4">
            {DEFAULT_TIERS.map((tier) => (
              <div key={tier.name} className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border">
                  <span className="font-black uppercase tracking-wider text-text-primary">{tier.label}</span>
                  <span className="font-black text-gold">₹{tier.price}</span>
                </div>

                <div className="space-y-2 pt-1">
                  {tier.rows.map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center justify-center gap-2">
                      <span className="w-4 text-xs font-bold text-text-muted text-center">{rowLetter}</span>
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
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary text-white shadow-cta scale-110 ring-2 ring-primary/60'
                                    : isBooked
                                    ? 'bg-surface-elevated text-text-muted cursor-not-allowed opacity-40 border border-border line-through'
                                    : isLocked
                                    ? 'bg-gold/15 text-gold border border-gold/40 cursor-not-allowed'
                                    : 'bg-surface hover:bg-surface-hover border border-border hover:border-gold text-text-primary'
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
                      <span className="w-4 text-xs font-bold text-text-muted text-center">{rowLetter}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Glowing Screen Banner */}
            <div className="pt-8 text-center space-y-2">
              <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent rounded-full shadow-gold-glow opacity-80" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                All Eyes This Way • Cinema RGB Silver Screen
              </p>
            </div>
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="p-4 sm:p-6 bg-surface-elevated border-t border-border flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-black text-text-muted block tracking-wider">Seats Selected</span>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-text-primary">
                {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : 'None'}
              </span>
              <span className="text-xs text-text-muted">({selectedSeats.length} Tickets)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-text-muted block tracking-wider">Payable</span>
              <span className="text-lg sm:text-2xl font-black text-gold">₹{totalAmount}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className={`px-6 sm:px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-gradient-to-r from-primary to-accent-hover hover:from-primary hover:to-primary text-white shadow-cta transform hover:scale-105'
                  : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border'
              }`}
            >
              <span>Confirm & Pay</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionModal;

