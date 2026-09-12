import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export const DigitalTicket = ({ booking }) => {
  const ticketRef = useRef(null);
  const { toast } = useToast();

  if (!booking) return null;

  const bookingId = booking.booking_id || booking.bookingId || 'CB-2026-TICKET';
  const movieTitle = booking.movie_title || booking.movie?.title || booking.movieTitle || 'Blockbuster Movie';
  const moviePoster = booking.movie_poster || booking.movie?.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop';
  const theatreName = booking.theatre_name || booking.theatre?.name || booking.theatreName || 'CineBook Multiplex';
  const screenName = booking.screen_name || booking.screen || 'Audi 1 (Dolby Atmos - 4K Laser)';
  const showDate = booking.show_date || booking.date || 'Today';
  const showTime = booking.show_time || booking.time || '07:30 PM';
  const seats = booking.seats || [];
  const seatNames = seats.map((s) => (typeof s === 'string' ? s : s.id || s.seatNumber)).join(', ');
  const totalAmount = booking.total_amount || booking.totalAmount || 0;
  const qrPayload = booking.ticket_qr_payload || `https://cinebook.in/verify?booking_id=${bookingId}&status=CONFIRMED`;

  const handleDownloadTicket = () => {
    window.print();
    toast.success('Print / Save as PDF prompt opened.');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CineBook Movie Ticket - ${movieTitle}`,
          text: `My booking for ${movieTitle} at ${theatreName} on ${showDate} (${seatNames})`,
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Ticket link copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6">
      {/* Ticket Container */}
      <div
        ref={ticketRef}
        className="relative bg-surface rounded-3xl border border-border/80 shadow-2xl overflow-hidden transition-all duration-300 print:border-none print:shadow-none"
      >
        {/* Top Header Glow Banner */}
        <div className="relative h-28 bg-gradient-to-r from-primary/20 via-gold/15 to-surface overflow-hidden p-6 flex items-end justify-between border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Verified Cinema Pass
            </span>
          </div>

          <div className="relative z-10 text-right">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">Booking ID</span>
            <span className="font-mono text-xs font-black text-gold tracking-wider">{bookingId}</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Movie Details Grid */}
          <div className="flex gap-4 sm:gap-6">
            <img
              src={moviePoster}
              alt={movieTitle}
              className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-2xl shadow-lg border border-border/60 shrink-0"
            />
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    CONFIRMED
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-wider">
                    4K DOLBY ATMOS
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate">
                  {movieTitle}
                </h3>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{theatreName}</span>
                </p>
                <p className="text-[11px] text-text-muted mt-0.5 pl-5 truncate">
                  {screenName}
                </p>
              </div>

              {/* Show Time / Date */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Date</span>
                    <span className="text-xs font-bold text-text-primary">{showDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Time</span>
                    <span className="text-xs font-bold text-text-primary">{showTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat & Audi Information Bar */}
          <div className="rounded-2xl bg-surface-elevated/80 border border-border/80 p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Auditorium
              </span>
              <span className="text-sm font-black text-text-primary">Audi 01</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Seats ({seats.length})
              </span>
              <span className="text-sm font-black text-gold">{seatNames || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Total Paid
              </span>
              <span className="text-sm font-black text-emerald-400">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Perforated Stub Line with Cut-out Notches */}
        <div className="relative flex items-center justify-between px-2 py-1">
          <div className="w-6 h-6 rounded-full bg-background -ml-5 border-r border-border/80 shadow-inner" />
          <div className="flex-1 border-b-2 border-dashed border-border/80 mx-2" />
          <div className="w-6 h-6 rounded-full bg-background -mr-5 border-l border-border/80 shadow-inner" />
        </div>

        {/* Ticket Stub & QR Verification */}
        <div className="p-6 sm:p-8 bg-surface-elevated/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-border shrink-0">
              <QRCodeSVG
                value={qrPayload}
                size={96}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-text-primary flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Scan at Turnstile Gate
              </span>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[200px]">
                Show this digital QR code directly to the usher or scan at cinema entry gates.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto print:hidden">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-bold text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-bold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
