import React, { useState } from 'react';
import { Film, ShieldCheck, RefreshCw, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const AboutPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-cine-primary uppercase tracking-wider">Our Story</span>
      <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">About CineBook</h1>
      <p className="text-sm text-cine-textMuted max-w-xl mx-auto">
        Next-generation cinema & event ticketing built with real-time seat lock protection, verified payments, and digital QR gate validation.
      </p>
    </div>

    <div className="p-8 rounded-3xl bg-cine-surface border border-cine-border space-y-6 leading-relaxed text-sm text-zinc-300">
      <h2 className="text-lg font-bold text-white">Redefining Entertainment Ticketing</h2>
      <p>
        CineBook was engineered from the ground up to solve the most frustrating issue in entertainment reservations: double-booking race conditions during high-demand blockbuster ticket drops.
      </p>
      <p>
        With our proprietary atomic seat-locking engine, when you select a seat, our backend temporarily locks it for you for 5 minutes, ensuring complete peace of mind while you complete checkout without losing your favorite recliner or IMAX sweet spot.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-cine-card border border-cine-border text-center">
          <span className="text-2xl font-extrabold text-white">100+</span>
          <p className="text-xs text-cine-textMuted mt-1">Partner Multiplexes</p>
        </div>
        <div className="p-4 rounded-2xl bg-cine-card border border-cine-border text-center">
          <span className="text-2xl font-extrabold text-cine-primary">0%</span>
          <p className="text-xs text-cine-textMuted mt-1">Double Booking Rate</p>
        </div>
        <div className="p-4 rounded-2xl bg-cine-card border border-cine-border text-center">
          <span className="text-2xl font-extrabold text-cine-accent">Instant</span>
          <p className="text-xs text-cine-textMuted mt-1">QR Code Delivery</p>
        </div>
      </div>
    </div>
  </div>
);

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-cine-primary uppercase tracking-wider">Get in Touch</span>
        <h1 className="text-3xl font-display font-extrabold text-white">24/7 Dedicated Support</h1>
        <p className="text-sm text-cine-textMuted">Have a query about your booking, payment, or cinema listing? We are here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cine-primary/10 text-cine-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Email Support</h3>
              <p className="text-xs text-zinc-300 mt-0.5">support@cinebook.in</p>
              <p className="text-[11px] text-cine-textMuted mt-1">Typical response time: under 15 minutes</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cine-accent/10 text-cine-accent">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Helpline</h3>
              <p className="text-xs text-zinc-300 mt-0.5">+91 (022) 8000-CINE (2463)</p>
              <p className="text-[11px] text-cine-textMuted mt-1">Available 24 hours, 7 days a week</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cine-surface border border-cine-border flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cine-secondary/10 text-cine-secondary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Headquarters</h3>
              <p className="text-xs text-zinc-300 mt-0.5">CineBook Tech Tower, Bandra Kurla Complex, Mumbai, MH 400051</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 rounded-3xl bg-cine-surface border border-cine-border">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Message Dispatched</h3>
              <p className="text-xs text-zinc-300">Our customer care representative will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Send us a message</h3>
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full px-3.5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-xs placeholder-cine-textMuted focus:outline-none focus:border-cine-primary"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-3.5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-xs placeholder-cine-textMuted focus:outline-none focus:border-cine-primary"
                />
              </div>
              <div>
                <textarea
                  rows={4}
                  placeholder="How can we assist you with your booking?"
                  required
                  className="w-full px-3.5 py-2.5 bg-cine-card border border-cine-border rounded-xl text-white text-xs placeholder-cine-textMuted focus:outline-none focus:border-cine-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cine-primary hover:bg-cine-primaryHover text-white text-xs font-bold shadow-glow-primary transition-all"
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
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Customer Friendly</span>
      <h1 className="text-3xl font-display font-extrabold text-white">Cancellation & Refund Policy</h1>
      <p className="text-xs text-cine-textMuted">Transparent, automated refunds processed directly to your original payment source.</p>
    </div>

    <div className="p-8 rounded-3xl bg-cine-surface border border-cine-border space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>100% Ticket Base Amount Refund available for all eligible partner cinemas.</span>
      </div>

      <h2 className="text-base font-bold text-white pt-2">1. Cancellation Time Windows</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Up to 2 Hours before showtime:</strong> 100% of ticket base price refunded.</li>
        <li><strong>Within 2 Hours of showtime:</strong> Cancellation is disabled as seats are locked for cinema operations.</li>
      </ul>

      <h2 className="text-base font-bold text-white pt-2">2. Convenience Fee & Taxes</h2>
      <p>
        Internet convenience fee and applicable GST charges collected for payment gateway processing and software infrastructure are non-refundable once an order is verified.
      </p>

      <h2 className="text-base font-bold text-white pt-2">3. Refund Processing Timeline</h2>
      <p>
        Upon cancelling your booking in the "My Bookings" dashboard, the backend triggers an automated Razorpay reverse webhook. The refund is credited back to your original source (UPI, Credit/Debit Card, Net Banking) within 3–5 business days.
      </p>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 className="text-3xl font-display font-extrabold text-white">Terms of Service</h1>
    <div className="p-8 rounded-3xl bg-cine-surface border border-cine-border space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <p>Welcome to CineBook. By using our website or booking entertainment tickets through our portal, you agree to these Terms of Service.</p>
      <h3 className="text-white font-bold">1. Seat Reservations & Temporary Locks</h3>
      <p>Seats are held on a temporary 5-minute atomic lock. If payment verification is not completed within 5 minutes, the lock expires automatically.</p>
      <h3 className="text-white font-bold">2. Digital QR Code Entry</h3>
      <p>Every confirmed booking generates a unique encrypted QR ticket. Only one scan is permitted per ticket barcode.</p>
    </div>
  </div>
);

export const PrivacyPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <h1 className="text-3xl font-display font-extrabold text-white">Privacy Policy</h1>
    <div className="p-8 rounded-3xl bg-cine-surface border border-cine-border space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <p>Your privacy is paramount. CineBook does not sell or distribute your personal contact details to third-party advertisers.</p>
      <h3 className="text-white font-bold">Data Security</h3>
      <p>Payment transactions are processed through Razorpay's PCI-DSS Level 1 compliant gateway. We do not store sensitive credit/debit card numbers or CVVs on our servers.</p>
    </div>
  </div>
);
