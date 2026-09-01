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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <span className="text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Exhibitor Profile & Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight mt-1 font-display">
            Theatre & Bank Settlement Details
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Maintain your legal trade certifications and bank account for automated T+1 morning settlements
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-pink transition-all transform hover:scale-105"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Details Saved ✓' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. THEATRE DETAILS */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-[var(--theme-border)]">
          <h3 className="text-xs font-black uppercase text-pink-500 tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Theatre & Legal Trade Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-theme-muted font-bold block mb-1">Theatre Name</label>
              <input
                type="text"
                value={profile.theatre_name}
                onChange={(e) => setProfile({ ...profile, theatre_name: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                value={profile.owner_name}
                onChange={(e) => setProfile({ ...profile, owner_name: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={profile.gst_number}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Municipal Trade License</label>
              <input
                type="text"
                value={profile.trade_license}
                onChange={(e) => setProfile({ ...profile, trade_license: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-theme-muted font-bold block mb-1">Physical Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* 3. BANK SETTLEMENT ACCOUNT */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-[var(--theme-border)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4" /> Bank Account for Daily T+1 Payouts
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Penny Drop Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-theme-muted font-bold block mb-1">Bank Name</label>
              <input
                type="text"
                value={profile.bank_name}
                onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Account Holder Name (as per Bank)</label>
              <input
                type="text"
                value={profile.account_holder}
                onChange={(e) => setProfile({ ...profile, account_holder: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">Bank Account Number</label>
              <input
                type="text"
                value={profile.account_number}
                onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-black focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-theme-muted font-bold block mb-1">IFSC Code</label>
              <input
                type="text"
                value={profile.ifsc_code}
                onChange={(e) => setProfile({ ...profile, ifsc_code: e.target.value })}
                className="w-full p-2.5 glass-card rounded-2xl text-theme-primary font-black focus:outline-none focus:border-amber-500 font-mono uppercase"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerProfilePage;
