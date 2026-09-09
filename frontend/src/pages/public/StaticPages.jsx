import React, { useState } from 'react';
import { Film, ShieldCheck, RefreshCw, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const AboutPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[#F8FAFC]">
    <div className="text-center space-y-2">
      <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Our Architecture & Mission
      </span>
      <h1 className="text-3xl sm:text-4xl font-display font-black text-white">About CINEBOOK</h1>
      <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
        Next-generation cinema-tech platform built for independent single-screen exhibitors and premium multiplexes with real-time seat locking, instant refunds, and verified gate validation.
      </p>
    </div>

    <div className="p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-6 leading-relaxed text-sm text-slate-300 shadow-2xl">
      <h2 className="text-lg font-black text-white font-display">Empowering Single-Screen Cinema & Modern Audiences</h2>
      <p>
        CineBook was engineered from the ground up to solve the most critical challenges in regional and national cinema operations: eliminating seat-locking race conditions during blockbuster booking drops, safeguarding walk-in cash quotas for theatre partners, and providing instant 1-click bank refunds.
      </p>
      <p>
        With our dual-quota architecture and 30-minute auto-release safeguards, theatre owners never suffer empty seats, while moviegoers enjoy an uninterrupted Apple TV + BMS Luxe booking experience with real-time payment validation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-[#080B10] border border-[#1E293B] text-center space-y-1">
          <span className="text-2xl font-black text-white font-display">100+</span>
          <p className="text-xs text-[#94A3B8]">Partner Multiplexes & Single-Screens</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#080B10] border border-[#1E293B] text-center space-y-1">
          <span className="text-2xl font-black text-[#E50914] font-display">0%</span>
          <p className="text-xs text-[#94A3B8]">Double-Booking Collision Rate</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#080B10] border border-[#1E293B] text-center space-y-1">
          <span className="text-2xl font-black text-[#D4AF37] font-display">Instant</span>
          <p className="text-xs text-[#94A3B8]">80mm Print & QR Delivery</p>
        </div>
      </div>
    </div>
  </div>
);

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-[#F8FAFC]">
      <div className="text-center space-y-2">
        <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest">Get in Touch</span>
        <h1 className="text-3xl font-display font-black text-white">24/7 Dedicated Exhibitor & Guest Support</h1>
        <p className="text-sm text-[#94A3B8]">Have a query about your booking, payment, or theatre partner listing? We are here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F1523]/80 border border-[#1E293B] flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Email Desk</h3>
              <p className="text-xs text-slate-300 mt-0.5">support@cinebook.in</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Average response time: under 10 minutes</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1523]/80 border border-[#1E293B] flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-glow-gold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">24/7 Helpline</h3>
              <p className="text-xs text-slate-300 mt-0.5">+91 (022) 8000-CINE (2463)</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Available 24 hours, 7 days a week</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1523]/80 border border-[#1E293B] flex items-start gap-4 shadow-xl">
            <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Regional Hub</h3>
              <p className="text-xs text-slate-300 mt-0.5">CineBook Cinema-Tech Tower, Guntur & Vijayawada Hub, AP 522001</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] shadow-2xl">
          {submitted ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-black text-white">Message Dispatched</h3>
              <p className="text-xs text-slate-300">Our concierge support team has received your ticket and will respond immediately.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4 text-xs">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Send a message to support</h3>
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37] font-bold"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37] font-bold"
                />
              </div>
              <div>
                <textarea
                  rows={4}
                  placeholder="How can we assist you with your booking, theatre listing, or refund?"
                  required
                  className="w-full px-4 py-3 bg-[#080B10] border border-[#1E293B] rounded-xl text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#D4AF37] font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2B714] hover:from-[#E2B714] hover:to-[#D4AF37] text-black text-xs font-black uppercase tracking-wider shadow-glow-gold transition-all cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const CancellationPolicyPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in text-[#F8FAFC]">
    <div className="text-center space-y-2">
      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Transparent & Automated</span>
      <h1 className="text-3xl font-display font-black text-white">Cancellation & Instant Refund Policy</h1>
      <p className="text-xs text-[#94A3B8]">Automated 1-click refunds processed directly to your original payment source (UPI, Card, Net Banking).</p>
    </div>

    <div className="p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-2xl">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
        <span>100% Ticket Base Amount Refund available on all eligible cinema reservations.</span>
      </div>

      <h2 className="text-base font-black text-white pt-2">1. Cancellation Time Windows</h2>
      <ul className="list-disc pl-5 space-y-2 text-[#94A3B8]">
        <li><strong className="text-white">Up to 2 Hours before showtime:</strong> 100% of ticket base price refunded immediately.</li>
        <li><strong className="text-white">Within 2 Hours of showtime:</strong> Cancellation is locked as auditoriums begin operational checks.</li>
      </ul>

      <h2 className="text-base font-black text-white pt-2">2. Convenience Fee & Taxes</h2>
      <p className="text-[#94A3B8]">
        Platform convenience fee and applicable GST charges collected for payment gateway processing and software infrastructure are non-refundable once an order is issued.
      </p>

      <h2 className="text-base font-black text-white pt-2">3. Refund Processing Timeline</h2>
      <p className="text-[#94A3B8]">
        Upon cancelling your booking in the "My Bookings" dashboard or through CineBot AI, our system triggers an automated Razorpay reverse webhook. The refund is credited back to your original source with an instant UTR reference.
      </p>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in text-[#F8FAFC]">
    <h1 className="text-3xl font-display font-black text-white">Terms of Service</h1>
    <div className="p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-2xl">
      <p>Welcome to CineBook. By using our website or booking entertainment tickets through our portal, you agree to these Terms of Service.</p>
      <h3 className="text-white font-bold text-base">1. Seat Reservations & Temporary Atomic Locks</h3>
      <p className="text-[#94A3B8]">Seats are held on a temporary 8-minute atomic lock. If payment verification is not completed within 8 minutes, the lock expires automatically and seats are returned to live inventory.</p>
      <h3 className="text-white font-bold text-base">2. Digital QR Code Entry</h3>
      <p className="text-[#94A3B8]">Every confirmed booking generates a unique encrypted QR ticket. Only one scan is permitted per ticket barcode. Duplicate entry attempts are automatically flagged and rejected by Gatekeeper terminals.</p>
    </div>
  </div>
);

export const PrivacyPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in text-[#F8FAFC]">
    <h1 className="text-3xl font-display font-black text-white">Privacy Policy</h1>
    <div className="p-8 rounded-3xl bg-[#0F1523]/80 border border-[#1E293B] space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-2xl">
      <p>Your privacy is paramount. CineBook does not sell or distribute your personal contact details to third-party advertisers.</p>
      <h3 className="text-white font-bold text-base">Data Security & Payment Integrity</h3>
      <p className="text-[#94A3B8]">Payment transactions are processed through Razorpay's PCI-DSS Level 1 compliant gateway. We do not store sensitive credit/debit card numbers or CVVs on our servers.</p>
    </div>
  </div>
);
