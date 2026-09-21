import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Star,
  Film,
  Building
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const ShowtimeDetailsModal = ({
  isOpen,
  onClose,
  movie = {
    id: 'mov-pushpa-2',
    title: 'Pushpa 2: The Rule (2024)',
    censorRating: 'UA 16+',
    rating: '9.4',
    genres: ['Action', 'Drama', 'Thriller'],
    duration: '2h 45m',
    posterUrl: '/posters/pushpa2.jpg'
  },
  theatreName = 'Grand Cinema Complex - Screen 5',
  theatreAddress = 'Main Screen Complex, 4K Laser Projection',
  timeSlots = ['10:00 AM', '12:00 PM', '04:00 PM', '07:30 PM', '10:15 PM'],
  onConfirmShow
}) => {
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();

  // Generate 7-day date slots
  const dateSlots = useMemo(() => {
    const slots = [];
    const today = new Date();
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${daysOfWeek[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
      const shortDay = i === 0 ? 'Today' : daysOfWeek[d.getDay()];

      slots.push({
        isoDate,
        dayLabel,
        shortDay,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        monthName: months[d.getMonth()]
      });
    }
    return slots;
  }, []);

  const [selectedDateISO, setSelectedDateISO] = useState(dateSlots[0]?.isoDate);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0] || '10:00 AM');
  const [sampleSeats, setSampleSeats] = useState(['G12', 'G13', 'G14']);

  if (!isOpen) return null;

  const handleProceedToSeats = () => {
    const showObj = {
      id: `sh-${movie.id}-${selectedTime.replace(/[^0-9]/g, '')}`,
      movieId: movie.id,
      movieTitle: movie.title,
      theatreName: theatreName,
      screenName: 'Screen 5 (4K RGB Laser)',
      time: selectedTime,
      format: '4K Dolby Atmos',
      date: selectedDateISO
    };

    setSelectedMovie(movie);
    setSelectedDate(selectedDateISO);
    setSelectedShow(showObj);

    if (onConfirmShow) {
      onConfirmShow(showObj);
    } else {
      onClose();
      navigate(`/seat-selection/${showObj.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in text-white">
      <div className="relative w-full max-w-2xl bg-[#121824]/95 border border-[#E5A93C]/30 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(229,169,60,0.25)] flex flex-col max-h-[92vh]">
        
        {/* 1. THEATER HALL HEADER */}
        <div className="p-5 sm:p-6 bg-[#1A2234]/80 border-b border-[#E5A93C]/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E5A93C] to-[#FFD066] flex items-center justify-center text-[#0B0E14] shadow-[0_0_15px_rgba(229,169,60,0.4)]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
                  {theatreName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#FFD066] border border-[#E5A93C]/40 text-[10px] font-black">
                  4K LASER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>{theatreAddress}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#121824] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. MOVIE MINI SUMMARY BAR */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#0B0E14]/80 border-b border-[#E5A93C]/15 flex items-center gap-3.5">
          <img
            src={movie.poster || movie.posterUrl || '/posters/pushpa2.jpg'}
            alt={movie.title}
            className="w-10 h-14 rounded-xl object-cover border border-[#E5A93C]/20 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white truncate">{movie.title}</h3>
            <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5">
              <span className="text-[#FFD066] font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#FFD066] text-[#FFD066]" />
                {movie.rating || '9.4'}
              </span>
              <span>•</span>
              <span>{movie.genres?.join(', ') || movie.genre || 'Action, Drama'}</span>
              <span>•</span>
              <span>{movie.duration || '2h 45m'}</span>
            </div>
          </div>
        </div>

        {/* 3. MODAL BODY: DATE PICKER RIBBON + TIME SLOTS + SEAT INDICATORS */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* A. DATE PICKER RIBBON (Today, Sat, Sun...) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FFD066] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E5A93C]" />
                Select Showtime Date
              </span>
              <span className="text-slate-400 font-medium text-[11px]">Next 7 Days</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {dateSlots.map((slot) => {
                const isSelected = selectedDateISO === slot.isoDate;
                return (
                  <button
                    key={slot.isoDate}
                    type="button"
                    onClick={() => setSelectedDateISO(slot.isoDate)}
                    className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[78px] py-2.5 px-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#E5A93C] to-[#FFD066] border-[#FFD066] text-[#0B0E14] font-black shadow-[0_0_15px_rgba(229,169,60,0.5)] scale-105'
                        : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-300 hover:border-[#E5A93C]/60 hover:text-white'
                    }`}
                  >
                    <span className={`text-[10px] uppercase font-extrabold ${isSelected ? 'text-[#0B0E14]' : 'text-slate-400'}`}>
                      {slot.shortDay}
                    </span>
                    <span className="text-base font-black my-0.5 font-display">
                      {slot.dayNumber}
                    </span>
                    <span className={`text-[9px] font-bold ${isSelected ? 'text-[#0B0E14]' : 'text-slate-400'}`}>
                      {slot.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. TIME SLOTS (10:00 AM, 12:00 PM, 4:00 PM) WITH ACTIVE GLOW STATES */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FFD066] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                Available Time Slots
              </span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Fast Filling
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {timeSlots.map((slot) => {
                const isActive = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 px-4 rounded-2xl border text-xs font-black transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0E14] border-[#FFD066] shadow-[0_0_18px_rgba(229,169,60,0.6)] scale-102'
                        : 'bg-[#1A2234] border-[#E5A93C]/20 text-slate-200 hover:border-[#E5A93C]/60 hover:bg-[#222C42]'
                    }`}
                  >
                    <span className="text-sm font-black">{slot}</span>
                    <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#0B0E14]/80' : 'text-slate-400'}`}>
                      Dolby Atmos 7.1
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. SEAT SELECTION INDICATOR PILLS (G12, G13, G14) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#1A2234]/70 border border-[#E5A93C]/20">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#E5A93C]" />
              Recommended Best Seats
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {['G12', 'G13', 'G14', 'H10', 'H11'].map((seat) => {
                const isPicked = sampleSeats.includes(seat);
                return (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => {
                      if (sampleSeats.includes(seat)) {
                        setSampleSeats(sampleSeats.filter(s => s !== seat));
                      } else {
                        setSampleSeats([...sampleSeats, seat]);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isPicked
                        ? 'bg-[#E5A93C] text-[#0B0E14] shadow-[0_0_12px_rgba(229,169,60,0.5)] border border-[#FFD066]'
                        : 'bg-[#121824] text-slate-400 border border-[#E5A93C]/30 hover:border-[#E5A93C]'
                    }`}
                  >
                    <span>{seat}</span>
                    <span className="text-[10px] opacity-75">
                      {isPicked ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Center view Prime Balcony seats with optimal audio sweet spot.
            </p>
          </div>
        </div>

        {/* 4. MODAL FOOTER */}
        <div className="p-5 sm:p-6 bg-[#1A2234]/90 border-t border-[#E5A93C]/20 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
              Selected Showtime
            </span>
            <p className="text-xs sm:text-sm font-black text-white">
              {selectedTime} • <span className="text-[#FFD066]">{selectedDateISO}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceedToSeats}
            className="gold-glow-btn px-6 sm:px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Seat Grid</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailsModal;
