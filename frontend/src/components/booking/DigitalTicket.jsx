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
  ShieldCheck,
  ReceiptText,
  Volume2,
  Layers
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export const DigitalTicket = ({ booking }) => {
  const ticketRef = useRef(null);
  const { toast } = useToast();

  if (!booking) return null;

  const bookingId = booking.booking_id || booking.bookingId || 'CB-2026-TICKET';
  const movieTitle = booking.movie_title || booking.movie?.title || booking.movieTitle || 'Pushpa 2: The Rule';
  const moviePoster = booking.movie_poster || booking.movie?.posterUrl || booking.movie?.poster || '/posters/pushpa2.jpg';
  const theatreName = booking.theatre_name || booking.theatre?.name || booking.theatreName || 'Siva Cinemas 4K Laser';
  const screenName = booking.screen_name || booking.screen || 'Audi 01 (Dolby Atmos - 4K Laser)';
  const showDate = booking.show_date || booking.date || booking.showDate || new Date().toISOString().split('T')[0];
  const showTime = booking.show_time || booking.time || booking.show?.time || '11:00 AM';
  const seats = booking.seats || [];
  const seatNames = seats.map((s) => (typeof s === 'string' ? s : s.id || s.seatNumber)).join(', ');
  const totalAmount = booking.total_amount || booking.totalAmount || 459;
  const qrPayload = booking.ticket_qr_payload || `https://cinebook.in/verify?booking_id=${bookingId}&status=CONFIRMED`;

  const handleDownloadTicket = () => {
    window.print();
    toast.success('Print / Save PDF prompt launched.');
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
    <div className="w-full max-w-xl mx-auto my-6 select-none">
      {/* 1. Main Luxury Ticket Shell */}
      <div
        ref={ticketRef}
        className="relative bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 print:border-none print:shadow-none"
      >
        {/* Top Metallic Amber / Crimson Glow Strip */}
        <div className="relative h-28 bg-gradient-to-r from-primary/25 via-amber-500/20 to-surface overflow-hidden p-6 flex items-end justify-between border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Verified Cinema E-Pass
            </span>
          </div>

          <div className="relative z-10 text-right">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">Booking Reference</span>
            <span className="font-mono text-xs font-black text-amber-500 tracking-wider">{bookingId}</span>
          </div>
        </div>

        {/* Main Ticket Information Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Movie Poster & Header Block */}
          <div className="flex gap-4 sm:gap-6">
            <img
              src={moviePoster}
              alt={movieTitle}
              onError={(e) => {
                const t = ((movieTitle || '')).toLowerCase();
                let fb = '/posters/pushpa2.jpg';
                if (t.includes('devara')) fb = '/posters/devara.jpg';
                else if (t.includes('kalki')) fb = '/posters/kalki.webp';
                else if (t.includes('og')) fb = '/posters/og.jpg';
                if (e.target.src !== fb && !e.target.src.endsWith(fb)) {
                  e.target.src = fb;
                }
              }}
              className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-2xl shadow-xl border border-border/80 shrink-0"
            />

            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    CONFIRMED
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                    4K LASER DOLBY ATMOS
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate font-sans">
                  {movieTitle}
                </h3>

                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{theatreName}</span>
                </p>

                <p className="text-[11px] text-text-muted mt-0.5 pl-5 truncate">
                  {screenName}
                </p>
              </div>

              {/* Show Time / Date Deck */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Date</span>
                    <span className="text-xs font-bold text-text-primary">{showDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Time</span>
                    <span className="text-xs font-bold text-text-primary">{showTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reserved Auditorium & Seats Banner */}
          <div className="rounded-2xl bg-surface-elevated/90 border border-border/80 p-4 grid grid-cols-3 gap-3 text-center shadow-inner">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Auditorium
              </span>
              <span className="text-sm font-black text-text-primary">AUDI 01</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Seats ({seats.length || 1})
              </span>
              <span className="text-sm font-black text-amber-500">{seatNames || 'A5, A6'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Total Paid
              </span>
              <span className="text-sm font-black text-emerald-500 dark:text-emerald-400">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Realistic Perforated Tear-off Line with Notches */}
        <div className="relative flex items-center justify-between px-2 py-1">
          <div className="w-6 h-6 rounded-full bg-background -ml-5 border-r border-border/80 shadow-inner" />
          <div className="flex-1 border-b-2 border-dashed border-border/80 mx-2" />
          <div className="w-6 h-6 rounded-full bg-background -mr-5 border-l border-border/80 shadow-inner" />
        </div>

        {/* Turnstile Gate Scanner Stub */}
        <div className="p-6 sm:p-8 bg-surface-elevated/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-border/60 shrink-0">
              <QRCodeSVG
                value={qrPayload}
                size={96}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-bold text-text-primary flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Scan at Cinema Turnstile
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed max-w-[210px]">
                Show this digital QR directly to the gate usher or optical turnstile scanner for admission.
              </p>
              <div className="pt-1 font-mono text-[9px] text-text-muted tracking-widest uppercase">
                CINEBOOK • GATE SECURED
              </div>
            </div>
          </div>

          {/* Action Deck */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto print:hidden">
            <button
              type="button"
              onClick={handleDownloadTicket}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-bold text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Print Pass</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-bold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
