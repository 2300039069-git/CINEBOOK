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
  Building,
  Home,
  Compass,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  Navigation
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export const ShowtimeDetailsModal = ({
  isOpen,
  onClose,
  movie = {
    id: 'mov-pushpa-2',
    title: 'Pushpa 2: The Rule',
    censorRating: 'UA 16+',
    rating: '4.9',
    genres: ['Action', 'Drama', 'Thriller'],
    duration: '2h 45m',
    posterUrl: '/posters/pushpa2.jpg'
  },
  theatreName = 'Grand Cinema Complex - Screen 5',
  theatreAddress = 'Screen 5, Grand Cinema Complex',
  timeSlots = ['10:00 AM', '12:00 PM', '4:00 PM', '8:00 PM'],
  onConfirmShow
}) => {
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow, setSelectedDate } = useBooking();

  // Timeline days: "Today", "Sat", "Sun", "Mon", "Tue"
  const dateSlots = useMemo(() => {
    const slots = [];
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const shortDay = i === 0 ? 'Today' : daysOfWeek[d.getDay()];

      slots.push({
        isoDate,
        shortDay,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        monthName: months[d.getMonth()]
      });
    }
    return slots;
  }, []);

  const [selectedDateISO, setSelectedDateISO] = useState(dateSlots[0]?.isoDate);
  const [selectedTime, setSelectedTime] = useState('12:00 PM');
  const [pickedSeats, setPickedSeats] = useState(['G12', 'G13', 'G14']);
  const [activeFilter, setActiveFilter] = useState('Nearby');

  if (!isOpen) return null;

  const handleProceedToSeats = () => {
    const showObj = {
      id: `sh-${movie.id}-${selectedTime.replace(/[^0-9]/g, '')}`,
      movieId: movie.id,
      movieTitle: movie.title,
      theatreName: theatreName,
      screenName: 'Screen 5, Grand Cinema Complex',
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

  const handleQuickSwap = () => {
    // Quick swap picked seats
    setPickedSeats(['L12', 'L13', 'L14']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0A14]/90 backdrop-blur-xl animate-fade-in text-white select-none">
      <div className="relative w-full max-w-2xl bg-[#120F24]/95 border border-[#E5A93C]/40 rounded-3xl overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.95),0_0_25px_rgba(229,169,60,0.35)] flex flex-col max-h-[94vh]">
        
        {/* 1. TOP HEADER: Navigation bar icons (Home, Discover, Tickets, Profile) */}
        <div className="p-4 sm:p-5 bg-[#1A1633]/90 border-b border-[#E5A93C]/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-[#FFE29A] font-black">
              <Home className="w-4 h-4 text-[#FFD066]" />
              <span className="hidden sm:inline">Home</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#FFD066] transition-colors cursor-pointer">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#FFD066] transition-colors cursor-pointer">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Tickets</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#FFD066] transition-colors cursor-pointer">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#120F24] text-slate-400 hover:text-white hover:bg-[#231E44] border border-[#E5A93C]/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. FILTER CHIPS ("Filter", "Sort", "Nearby") */}
        <div className="px-5 sm:px-6 py-3 bg-[#0B0A14]/80 border-b border-[#E5A93C]/20 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          {[
            { label: 'Filter', icon: SlidersHorizontal },
            { label: 'Sort', icon: ArrowUpDown },
            { label: 'Nearby', icon: Navigation }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveFilter(item.label)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0A14] border-[#FFE29A] font-black shadow-[0_0_10px_rgba(229,169,60,0.35)]'
                    : 'bg-[#120F24] border-[#E5A93C]/30 text-slate-300 hover:border-[#FFD066]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. MODAL BODY: SHOWTIME EXPLORER */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Hall Subtitle: "Grand Cinema Complex - Screen 5" */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD066] font-display">
              Showtime Explorer
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white font-display">
              {theatreName}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>{theatreAddress} • 4K RGB Laser Silver Screen</span>
            </p>
          </div>

          {/* Timeline Date Selector: Horizontal Dotted Track with days */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Timeline Date Selector
            </span>
            <div className="relative py-2">
              {/* Dotted Track Line Behind */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 border-t border-dashed border-[#E5A93C]/40 z-0" />

              <div className="relative z-10 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                {dateSlots.map((slot) => {
                  const isSelected = selectedDateISO === slot.isoDate;
                  return (
                    <button
                      key={slot.isoDate}
                      type="button"
                      onClick={() => setSelectedDateISO(slot.isoDate)}
                      className={`relative flex flex-col items-center justify-center min-w-[76px] py-2 px-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#E5A93C] to-[#FFD066] border-[#FFE29A] text-[#0B0A14] font-black shadow-[0_0_15px_rgba(229,169,60,0.5)] scale-105'
                          : 'bg-[#120F24] border-[#E5A93C]/30 text-slate-300 hover:border-[#FFD066] hover:text-white'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-extrabold ${isSelected ? 'text-[#0B0A14]' : 'text-slate-400'}`}>
                        {slot.shortDay}
                      </span>
                      <span className="text-base font-black font-display my-0.5">
                        {slot.dayNumber}
                      </span>
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-[#0B0A14]' : 'text-slate-400'}`}>
                        {slot.monthName}
                      </span>

                      {/* Gold Highlight Under Active Date */}
                      {isSelected && (
                        <span className="absolute -bottom-1 w-6 h-1 bg-[#FFE29A] rounded-full shadow-[0_0_8px_#FFD066]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Showtime Capsules: "10:00 AM", "12:00 PM" (active gold border), "4:00 PM" */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Showtimes Available
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {timeSlots.map((slot) => {
                const isActive = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0A14] border-2 border-[#FFE29A] shadow-[0_0_16px_rgba(229,169,60,0.6)] scale-102'
                        : 'bg-[#1A1633] border border-[#E5A93C]/30 text-slate-200 hover:border-[#FFD066] hover:bg-[#231E44]'
                    }`}
                  >
                    <span className="text-sm font-black">{slot}</span>
                    <span className={`text-[9px] font-extrabold uppercase ${isActive ? 'text-[#0B0A14]/80' : 'text-slate-400'}`}>
                      {isActive ? 'Selected' : 'Dolby 7.1'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Tags: Glowing Gold Badges showing picked seats ("G12", "G13", "G14") */}
          <div className="p-4 rounded-2xl bg-[#1A1633]/85 border border-[#E5A93C]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#FFD066] font-display">
                Your Chosen Seats
              </span>
              <span className="text-[10px] text-slate-400 font-bold">3 Seats Reserved</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {pickedSeats.map((seat) => (
                <div
                  key={seat}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5A93C] to-[#FFD066] text-[#0B0A14] font-black text-xs border border-[#FFE29A] shadow-[0_0_12px_rgba(229,169,60,0.5)] flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{seat}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Prime Center View • Dolby Atmos Surround Sound Sweetspot
            </p>
          </div>

          {/* Action Button: Notched Art-Deco Gold Button "Select Seats (G12, G13, G14) - $28.00" */}
          <button
            type="button"
            onClick={handleProceedToSeats}
            className="art-deco-gold-btn w-full py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_18px_rgba(229,169,60,0.45)]"
          >
            <Ticket className="w-4 h-4" />
            <span>Select Seats ({pickedSeats.join(', ')}) - $28.00</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4. BOTTOM FLOATING BAR: Split Footer (Quick-Swap + Metallic Gold "Confirm & Pay $28.00") */}
        <div className="p-4 sm:p-5 bg-[#0B0A14]/95 border-t border-[#E5A93C]/30 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleQuickSwap}
            className="px-4 py-3 rounded-xl bg-[#1A1633] hover:bg-[#231E44] border border-[#E5A93C]/30 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            Quick-Swap Seats
          </button>

          <button
            type="button"
            onClick={handleProceedToSeats}
            className="art-deco-gold-btn px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_18px_rgba(229,169,60,0.45)]"
          >
            <span>Confirm & Pay $28.00</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailsModal;
