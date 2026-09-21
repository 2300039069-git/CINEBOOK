import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Copy, Check, ShieldCheck, Ticket, Percent, CreditCard, Film, ArrowRight, Gift } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';

const PROMO_OFFERS = [
  {
    id: 'off-01',
    code: 'CINEFIRST50',
    title: 'First-Time Moviegoers Special',
    discount: '50% OFF up to ₹150',
    minBooking: 'Min 2 tickets',
    validity: 'Valid till 31 Dec 2026',
    category: 'Welcome Offer',
    badge: 'Trending',
    gradient: 'from-primary to-rose-700',
    description: 'Get an instant 50% discount on your very first movie booking on CINEBOOK. Applicable for Balcony & Second Class.',
    terms: ['Valid once per new registered user', 'Applicable on all showtimes', 'Cannot be clubbed with other promos']
  },
  {
    id: 'off-02',
    code: 'HDFCFEST',
    title: 'HDFC Bank Credit & Debit Cards',
    discount: 'Buy 1 Get 1 Free (Up to ₹250)',
    minBooking: 'Min 2 Balcony tickets',
    validity: 'Valid on Fri, Sat & Sun',
    category: 'Bank Offer',
    badge: 'Popular',
    gradient: 'from-blue-600 to-indigo-800',
    description: 'Book 2 Balcony seats using any HDFC Bank Credit or Debit card and receive the second ticket complimentary.',
    terms: ['Applicable on weekend shows', 'Max 2 complimentary tickets per month', 'Subject to monthly quota availability']
  },
  {
    id: 'off-03',
    code: 'SIVASPECIAL',
    title: 'Siva Cinemas Exclusive Blockbuster Deal',
    discount: 'Flat ₹50 Instant Cashback',
    minBooking: 'No minimum order',
    validity: 'Daily Shows',
    category: 'Cinema Special',
    badge: 'Exclusive',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Enjoy a flat ₹50 cashback directly credited to your wallet for all 4K Laser Dolby Atmos shows at Siva Cinemas Guntur.',
    terms: ['Applicable on all 4 daily showtimes', 'Cashback processed instantly upon checkout', 'Unlimited uses per customer']
  },
  {
    id: 'off-04',
    code: 'UPIPAY25',
    title: 'UPI & RuPay Instant Cashback',
    discount: 'Flat ₹25 OFF on Scan & Pay',
    minBooking: 'Min ₹100 order value',
    validity: 'Valid till 30 Nov 2026',
    category: 'UPI Special',
    badge: 'Instant',
    gradient: 'from-emerald-600 to-teal-800',
    description: 'Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM) at checkout for an instant ₹25 deduction.',
    terms: ['Applicable on UPI QR and UPI Intent payments', 'One usage per day per UPI ID', 'Instant discount reflected at payment']
  },
  {
    id: 'off-05',
    code: 'COMBOPOP',
    title: 'Snacks & Canteen Combo Voucher',
    discount: 'Free Jumbo Butter Popcorn with 4 Tickets',
    minBooking: 'Min 4 Balcony tickets',
    validity: 'Valid on Evening & Night Shows',
    category: 'Food & Beverage',
    badge: 'Hot Deal',
    gradient: 'from-purple-600 to-pink-700',
    description: 'Book a squad of 4 or more tickets and get a digital voucher for a Jumbo Butter Popcorn tub redeemable at the canteen counter.',
    terms: ['Voucher QR generated on digital ticket', 'Redeemable during show interval', 'Valid on all movies']
  },
  {
    id: 'off-06',
    code: 'ICICIBONUS',
    title: 'ICICI Bank Sapphiro & Coral Cards',
    discount: '25% Instant Savings (Up to ₹200)',
    minBooking: 'Min 2 tickets',
    validity: 'Valid all 7 days',
    category: 'Bank Offer',
    badge: 'VIP Perk',
    gradient: 'from-amber-600 to-red-800',
    description: 'Exclusive 25% discount for ICICI Bank premium cardholders across all formats including 4K Atmos.',
    terms: ['Valid twice per card per calendar month', 'Instant deduction during card checkout', 'Applicable online only']
  }
];

const OffersPage = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Welcome Offer', 'Bank Offer', 'Cinema Special', 'UPI Special', 'Food & Beverage'];

  const filteredOffers = selectedCategory === 'ALL'
    ? PROMO_OFFERS
    : PROMO_OFFERS.filter(o => o.category === selectedCategory);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard! Paste at checkout.`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 transition-colors">
      {/* 1. HERO HEADER BILLBOARD */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-surface-elevated/40 to-transparent border-b border-border pt-28 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Promo Codes & Discounts</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary font-sans">
            CINEBOOK <span className="text-primary">Offers & Deals</span>
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Save big on movie tickets, food combos, and bank partner deals. Copy your preferred coupon code and apply it during checkout.
          </p>
        </div>
      </div>

      {/* 2. CATEGORY FILTER TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-cta'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROMOTIONAL OFFERS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-surface border border-border hover:border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                {/* Top Banner Gradient Strip */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${offer.gradient}`} />

                <div className="p-6 space-y-4 flex-1">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      {offer.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold uppercase tracking-wide">
                      {offer.badge}
                    </span>
                  </div>

                  {/* Title & Discount */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors font-sans">
                      {offer.title}
                    </h3>
                    <p className="text-lg font-black text-amber-500 tracking-tight">
                      {offer.discount}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Terms Pills */}
                  <div className="pt-2 border-t border-border space-y-1 text-[11px] text-text-muted">
                    <p className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{offer.minBooking} • {offer.validity}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Coupon Code & Action Box */}
                <div className="p-4 bg-surface-elevated/70 border-t border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 bg-background border border-dashed border-border px-3 py-1.5 rounded-xl">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-xs font-black tracking-widest text-text-primary">
                      {offer.code}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-primary hover:bg-primary-hover text-white shadow-cta'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. REDEEM CALLOUT BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-surface to-surface-elevated border border-border p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-sans">
              Ready to Book Your Blockbuster?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Choose your movie, pick your favourite seat at Siva Cinemas, and paste your discount code on the checkout page.
            </p>
          </div>

          <Link to="/movies">
            <Button variant="primary" size="lg" className="shrink-0 shadow-cta">
              <span>Browse Movies Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
