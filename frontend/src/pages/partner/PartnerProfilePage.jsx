import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Landmark
} from 'lucide-react';

const PartnerProfilePage = () => {
  const [profile, setProfile] = useState({
    theatre_name: 'Siva Cinemas',
    owner_name: 'K. Siva Rama Krishna',
    email: 'partner@sivacinemas.com',
    phone: '+91 98480 12345',
    city: 'Guntur',
    address: 'Near Old Bus Stand, Main Road, Guntur - 522001',
    gst_number: '37AAAAA0000A1Z5',
    trade_license: 'GMC/TL/2026/8491',
    bank_name: 'State Bank of India',
    account_number: '308491029481',
    ifsc_code: 'SBIN0000840',
    account_holder: 'Siva Cinemas Exhibitors LLP'
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-text-primary">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gold" /> Exhibitor Profile & Legal Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1 font-display">
            Theatre & Bank Settlement Details
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Maintain your legal trade certifications and bank account for automated T+1 morning settlements
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black text-xs font-black uppercase tracking-wider shadow-gold-glow transition-all transform hover:scale-105 cursor-pointer"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isSaved ? 'Details Saved ✓' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. THEATRE DETAILS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface space-y-4 border border-border shadow-sm">
          <h3 className="text-xs font-black uppercase text-gold tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Theatre & Legal Trade Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-muted font-bold block mb-1">Theatre Name</label>
              <input
                type="text"
                value={profile.theatre_name}
                onChange={(e) => setProfile({ ...profile, theatre_name: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                value={profile.owner_name}
                onChange={(e) => setProfile({ ...profile, owner_name: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={profile.gst_number}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">Municipal Trade License</label>
              <input
                type="text"
                value={profile.trade_license}
                onChange={(e) => setProfile({ ...profile, trade_license: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-text-muted font-bold block mb-1">Physical Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* 3. BANK SETTLEMENT ACCOUNT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface space-y-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-gold tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-gold" /> Bank Account for Daily T+1 Payouts
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> Penny Drop Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-text-muted font-bold block mb-1">Bank Name</label>
              <input
                type="text"
                value={profile.bank_name}
                onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">Account Holder Name (as per Bank)</label>
              <input
                type="text"
                value={profile.account_holder}
                onChange={(e) => setProfile({ ...profile, account_holder: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-text-primary font-bold focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">Bank Account Number</label>
              <input
                type="text"
                value={profile.account_number}
                onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-gold font-black focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="text-text-muted font-bold block mb-1">IFSC Code</label>
              <input
                type="text"
                value={profile.ifsc_code}
                onChange={(e) => setProfile({ ...profile, ifsc_code: e.target.value })}
                className="w-full p-3 bg-background border border-border rounded-xl text-gold font-black focus:outline-none focus:border-gold font-mono uppercase"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerProfilePage;
