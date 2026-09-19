import React, { useState } from 'react';
import {
  Film,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  FileText,
  CreditCard,
  Building2,
  Send,
  HelpCircle,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

// ============================================================================
// 1. ABOUT US PAGE (/about)
// ============================================================================
export const AboutPage = () => (
  <div className="min-h-screen py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in bg-background text-text-primary transition-colors">
    {/* Hero Header */}
    <div className="text-center space-y-3">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5" /> Next-Gen Cinema Platform
      </span>
      <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight font-sans">
        About CINE<span className="text-primary">BOOK</span>
      </h1>
      <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
        India's modern movie ticketing and cinema-tech platform connecting passionate cinema lovers directly to local single-screen auditoriums and premium partner multiplexes.
      </p>
    </div>

    {/* Platform Overview */}
    <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border space-y-6 leading-relaxed text-sm text-text-secondary shadow-card">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <Film className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-text-primary font-sans">Bridging Heritage Cinemas & Digital Audiences</h2>
          <p className="text-xs text-text-muted">Empowering independent exhibitors with cloud-native box-office technology</p>
        </div>
      </div>

      <p className="text-base text-text-primary font-medium leading-relaxed">
        CineBook was founded with a single mission: to provide moviegoers with a transparent, ultra-fast, and effortless ticket booking experience while giving regional single-screen theatres and independent multiplexes enterprise-grade ticketing, real-time seat locking, and live gate scanning technology.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Transparent & Lowest Fees
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Unlike traditional aggregator platforms with exorbitant convenience surcharges, CineBook champions fair cinema pricing with transparent flat handling fees of just ₹10.00 per ticket.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero-Collision Atomic Seat Locks
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Our high-throughput concurrency engine holds seats on a secure 8-minute atomic lock, eliminating double-booking collisions and payment race conditions during blockbuster drops.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Instant Digital QR Entry
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every booking delivers an instant encrypted QR ticket pass directly to your screen, compatible with cinema turnstile laser scanners and 80mm thermal receipt printers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <h3 className="font-bold text-text-primary flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Certified Bank & Vyapar Security
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All customer transactions are secured via PCI-DSS Level 1 certified gateways and Vyapar/UPI Rails, with 256-bit SSL encryption and full RBI compliance.
          </p>
        </div>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border text-center space-y-1">
          <span className="text-3xl font-black text-text-primary font-sans">100+</span>
          <p className="text-xs text-text-muted">Partner Theatres & Screens</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border text-center space-y-1">
          <span className="text-3xl font-black text-primary font-sans">₹10.00</span>
          <p className="text-xs text-text-muted">Flat Lowest Convenience Fee</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border text-center space-y-1">
          <span className="text-3xl font-black text-emerald-500 font-sans">100%</span>
          <p className="text-xs text-text-muted">Secure Instant UPI Rails</p>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// 2. CONTACT US PAGE (/contact)
// ============================================================================
export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bookingId: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in bg-background text-text-primary transition-colors">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Support & Assistance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight font-sans">
          Contact CINE<span className="text-primary">BOOK</span>
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
          Have a question about your movie tickets, booking status, refund, or exhibitor partnership? Our dedicated support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Email Support */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-start gap-4 shadow-sm hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Official Support Email</h3>
              <a
                href="mailto:support@cinebook.in"
                className="text-xs font-semibold text-primary hover:underline block mt-0.5"
              >
                support@cinebook.in
              </a>
              <p className="text-[11px] text-text-muted mt-1">Average response time: within 15–30 minutes</p>
            </div>
          </div>

          {/* Active Phone Helpline */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-start gap-4 shadow-sm hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Customer Care Helpline</h3>
              <a
                href="tel:+919848012345"
                className="text-xs font-semibold text-text-primary hover:text-primary block mt-0.5"
              >
                +91 (022) 8000-CINE (2463) / +91 98480 12345
              </a>
              <p className="text-[11px] text-text-muted mt-1">Toll-free customer assistance for booking queries</p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-start gap-4 shadow-sm hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Operational Support Hours</h3>
              <p className="text-xs font-bold text-amber-500 mt-0.5">10:00 AM – 10:00 PM IST</p>
              <p className="text-[11px] text-text-muted mt-1">Operational all 7 days a week (Monday – Sunday)</p>
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-start gap-4 shadow-sm hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Operational Business Address</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                <strong>CineBook Media Technologies Pvt. Ltd.</strong><br />
                Cinema-Tech Tower, Cinema Road, Near Old Bus Stand,<br />
                Guntur & Vijayawada Hub, Andhra Pradesh – 522001, India.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Query Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-sans">Support Request Received</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                Thank you for contacting CineBook support. Ticket reference has been generated for <strong>{formData.email}</strong>. Our concierge team will reach out to you within 30 minutes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', bookingId: '', subject: 'General Inquiry', message: '' });
                }}
                className="px-6 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-bold text-text-primary transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-text-primary font-sans">Send a Support Query</h3>
                <p className="text-xs text-text-muted mt-0.5">Please provide your details below and we will get back to you shortly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98480 12345"
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Booking ID (If applicable)</label>
                  <input
                    type="text"
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    placeholder="e.g. CB-2026-894120"
                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Query Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Ticket Booking Issue">Ticket Booking Issue</option>
                  <option value="Payment / UPI Status">Payment / UPI Status</option>
                  <option value="Cancellation & Refund Request">Cancellation & Refund Request</option>
                  <option value="Theatre / Exhibitor Partnership">Theatre / Exhibitor Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Your Message / Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your query in detail with show date, theatre name, or payment reference ID..."
                  className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary text-xs font-bold transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider shadow-cta flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Support Query</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. TERMS & CONDITIONS PAGE (/terms)
// ============================================================================
export const TermsPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
    <div className="text-center space-y-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
        <FileText className="w-3.5 h-3.5" /> Legal Governance
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-sans">
        Terms & Conditions
      </h1>
      <p className="text-xs text-text-muted">Last Updated: September 2026 • Governed under the Information Technology Act, 2000</p>
    </div>

    <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border space-y-6 text-xs sm:text-sm text-text-secondary leading-relaxed shadow-card">
      <p className="text-text-primary font-medium">
        Welcome to <strong>CineBook</strong> (operated by CineBook Media Technologies Pvt. Ltd.). By accessing our website, mobile application, or purchasing movie tickets through our platform, you explicitly agree to be bound by these Terms & Conditions.
      </p>

      {/* Section 1 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">1. User Account & Registration Obligations</h2>
        <p>
          To purchase tickets or access the booking history, users must provide accurate, complete, and verifiable contact details including their full name, active mobile number, and valid email address. The user is responsible for maintaining the confidentiality of their credentials and for all activities carried out under their account.
        </p>
        <p>
          For movies rated <strong>'A' (Adults Only)</strong> by the Central Board of Film Certification (CBFC), tickets may only be booked for and consumed by individuals aged 18 years or older. Cinema management reserves the right to request valid government ID proof at the auditorium entrance.
        </p>
      </div>

      {/* Section 2 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">2. Booking Limits & Atomic Seat Allocation</h2>
        <p>
          To prevent black-marketing, bulk automated hoarding, and ticket scalping, CineBook enforces a maximum booking limit of <strong>10 seats per transaction</strong> per user.
        </p>
        <p>
          When you select seats, they are held in a temporary atomic lock for a maximum duration of <strong>8 minutes</strong>. If payment confirmation is not completed within this window, the lock expires automatically and seats are released back to public inventory.
        </p>
      </div>

      {/* Section 3 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">3. Cinema Hall Admission & Operational Policies</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
          <li><strong>Admission Right:</strong> Admission to the auditorium is strictly governed by the rules, regulations, and operational policies of the respective cinema hall / theatre management.</li>
          <li><strong>Outside Food & Beverages:</strong> Outside food, beverages, liquor, and commercial recording equipment are strictly prohibited inside cinema auditoriums as per theatre partner mandates.</li>
          <li><strong>Digital QR Verification:</strong> Entry is authenticated by scanning the digital QR code on your verified electronic ticket. Each QR pass allows a single entry; duplicate or forged passes will be automatically flagged and rejected.</li>
          <li><strong>Age Verification:</strong> Patrons under 18 years of age will not be permitted into 'A' rated movies, even if accompanied by adults. No refunds will be issued for tickets denied entry due to age rating non-compliance.</li>
        </ul>
      </div>

      {/* Section 4 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">4. Payments, Internet Handling Fees & Taxes</h2>
        <p>
          All online ticket purchases are securely processed through authorized RBI-compliant payment gateway partners, including Vyapar Gateway and UPI rails.
        </p>
        <p>
          The total payable amount consists of the Base Ticket Price (determined by the cinema exhibitor, including municipal entertainment taxes/GST) plus a nominal Internet Handling / Convenience Fee (Flat ₹10.00) and 18% Integrated GST on the handling fee (SAC 998599).
        </p>
      </div>

      {/* Section 5 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">5. Intellectual Property & Limitation of Liability</h2>
        <p>
          All trademarks, logos, showtime data structures, and brand assets on CineBook are the proprietary property of CineBook Media Technologies Pvt. Ltd. CineBook acts as a ticketing technology facilitator and is not liable for changes in movie showtimes, auditorium projector/sound technical failures, cast alterations, or cancellations initiated directly by theatre owners.
        </p>
      </div>
    </div>
  </div>
);

// ============================================================================
// 4. PRIVACY POLICY PAGE (/privacy)
// ============================================================================
export const PrivacyPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
    <div className="text-center space-y-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5" /> Data Security & PCI-DSS
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-sans">
        Privacy Policy
      </h1>
      <p className="text-xs text-text-muted">Last Updated: September 2026 • In compliance with IT (Reasonable Security Practices) Rules, 2011</p>
    </div>

    <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border space-y-6 text-xs sm:text-sm text-text-secondary leading-relaxed shadow-card">
      <p className="text-text-primary font-medium">
        At <strong>CineBook</strong>, we are committed to safeguarding the personal privacy of our users. This Privacy Policy details how we collect, process, tokenize, and protect your information when using our services.
      </p>

      {/* Section 1 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">1. Personal Information We Collect</h2>
        <p>When you book movie tickets or register an account on CineBook, we collect minimal necessary data:</p>
        <ul className="list-disc pl-5 space-y-1 text-text-secondary">
          <li><strong>Contact Details:</strong> Full Name, Email Address, and Mobile Phone Number (used exclusively for ticket generation, SMS/WhatsApp digital pass dispatch, and booking alerts).</li>
          <li><strong>Transaction Information:</strong> Order ID, Show Date, Seat Numbers, Cinema Name, and Total Transaction Value.</li>
          <li><strong>Technical Identifiers:</strong> IP Address, browser device type, and session timestamps used for security audits and fraud mitigation.</li>
        </ul>
      </div>

      {/* Section 2 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">2. Payment Tokenization & PCI-DSS Certified Processing</h2>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-text-primary flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong>PCI-DSS Compliant Payment Security:</strong> All digital payments on CineBook are processed via certified RBI-licensed gateway aggregators. CineBook <u>never</u> collects, views, or stores your sensitive payment data (such as 16-digit Card Numbers, CVVs, Expiry Dates, or UPI PINs) on our servers. All financial communication is protected with 256-bit SSL encryption.
          </p>
        </div>
      </div>

      {/* Section 3 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">3. Strict Non-Sharing & Data Protection Guarantee</h2>
        <p>
          We operate under a <strong>strict zero-monetization policy</strong> regarding customer data:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-text-secondary">
          <li>We <strong>never sell, rent, or trade</strong> your personal contact information to third-party advertisers, telemarketers, or external data brokers.</li>
          <li>Your booking details are shared only with the specific cinema theatre management for the sole purpose of validating entry at the auditorium gate.</li>
        </ul>
      </div>

      {/* Section 4 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">4. Cookies & Session Storage</h2>
        <p>
          CineBook uses essential local storage and session cookies solely to preserve your visual theme preference (Dark Mode / Light Mode), active city selection, and authentication token. No invasive cross-site tracking cookies are deployed.
        </p>
      </div>

      {/* Section 5 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">5. User Data Rights & Grievance Officer</h2>
        <p>
          Under the Information Technology Rules, you retain the right to review, update, or request deletion of your registered personal information. For any privacy or data security inquiries, contact our designated Grievance Officer at <a href="mailto:grievance@cinebook.in" className="text-primary font-bold hover:underline">grievance@cinebook.in</a> or <a href="mailto:support@cinebook.in" className="text-primary font-bold hover:underline">support@cinebook.in</a>.
        </p>
      </div>
    </div>
  </div>
);

// ============================================================================
// 5. REFUND & CANCELLATION POLICY PAGE (/cancellation-refunds)
// ============================================================================
export const CancellationRefundsPage = () => (
  <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
    <div className="text-center space-y-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
        <RefreshCw className="w-3.5 h-3.5" /> Merchant Compliance
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-sans">
        Refund & Cancellation Policy
      </h1>
      <p className="text-xs text-text-muted">Standard Operating Policy for Movie Reservations, Show Disruptions & Automated Reversals</p>
    </div>

    <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border space-y-6 text-xs sm:text-sm text-text-secondary leading-relaxed shadow-card">
      {/* Primary Policy Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
          <span>Standard Ticket Non-Cancellation Rule</span>
        </div>
        <p className="text-text-primary font-semibold leading-relaxed">
          "Movie tickets once confirmed cannot be cancelled, exchanged, or refunded as per cinema partner rules."
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          Because cinema seats represent perishable time-locked inventory allocated in real time on exhibitor box-office systems, tickets once issued cannot be modified or refunded for personal scheduling conflicts, late arrivals, or change of mind.
        </p>
      </div>

      {/* Exceptional Scenario: Theatre Show Cancellation */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Show Cancellation & Technical Failure Exception</span>
        </div>
        <p className="text-text-primary font-semibold leading-relaxed">
          "In the rare event of show cancellation or technical failure by the theatre management, a 100% refund of the base ticket amount will be credited back to the original payment source within 5–7 business days."
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          In cases of cinema projector malfunction, power disruption, government-mandated closures, or cancellation by the theatre exhibitor, our automated reconciliation engine initiates a full reversal without requiring customer action.
        </p>
      </div>

      {/* Section 1: Payment Deducted But Ticket Not Generated */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">1. Payment Deductions on Incomplete / Failed Transactions</h2>
        <p>
          In rare circumstances where your bank account or UPI wallet is debited but a network latency prevents ticket issuance before the 8-minute seat lock expires, the transaction is marked as 'FAILED'.
        </p>
        <p>
          In all such failed transaction events, the debited amount is automatically reversed by the payment gateway to your original payment source within <strong>24 to 48 banking hours</strong> (or maximum 3–5 working days depending on your issuing bank).
        </p>
      </div>

      {/* Section 2: Convenience Fees */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">2. Internet Handling / Convenience Charges</h2>
        <p>
          The nominal Internet Handling Fee (Flat ₹10.00) and associated GST (18%) represent software gateway authorization and infrastructure maintenance costs incurred during transaction execution, and are non-refundable once an order has been successfully generated.
        </p>
      </div>

      {/* Section 3: Refund Tracking & Customer Desk */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h2 className="text-base font-bold text-text-primary">3. Refund Queries & Escalation Support</h2>
        <p>
          If your refund has not reflected in your bank account after the stipulated 5–7 business days, please write to our support desk with your <strong>Booking ID</strong> and <strong>Payment Reference ID</strong>:
        </p>
        <div className="p-4 rounded-xl bg-surface-elevated border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-text-muted block text-[11px]">Support Email Desk:</span>
            <a href="mailto:support@cinebook.in" className="font-bold text-primary hover:underline">support@cinebook.in</a>
          </div>
          <div>
            <span className="text-text-muted block text-[11px]">Customer Care Helpline:</span>
            <span className="font-bold text-text-primary">+91 (022) 8000-CINE (2463)</span>
          </div>
          <div>
            <span className="text-text-muted block text-[11px]">Operational Hours:</span>
            <span className="font-bold text-amber-500">10:00 AM – 10:00 PM IST</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Backward compatible export
export const CancellationPolicyPage = CancellationRefundsPage;
