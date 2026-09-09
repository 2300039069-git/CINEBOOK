import React, { useState } from 'react';
import {
  ReceiptText,
  Download,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ArrowDownToLine,
  Printer
} from 'lucide-react';

const SETTLEMENTS = [
  {
    id: 'SETTL-2026-0902',
    date: '2026-09-02',
    theatre_name: 'Siva Cinemas',
    gross_revenue: 173160.0,
    tickets_online: 735,
    tickets_counter: 90,
    total_tickets: 825,
    platform_fee: 0.0,
    gst_collected: 31168.8,
    net_payout: 173160.0,
    status: 'PROCESSING',
    bank_account: 'SBI (A/C: ****29481)',
    bank_ref: 'NEFT/PENDING-T1',
    payout_time: 'Tomorrow, 09:00 AM IST'
  },
  {
    id: 'SETTL-2026-0901',
    date: '2026-09-01',
    theatre_name: 'Siva Cinemas',
    gross_revenue: 189400.0,
    tickets_online: 790,
    tickets_counter: 120,
    total_tickets: 910,
    platform_fee: 0.0,
    gst_collected: 34092.0,
    net_payout: 189400.0,
    status: 'TRANSFERRED',
    bank_account: 'SBI (A/C: ****29481)',
    bank_ref: 'UTR-SBIN9284910294',
    payout_time: '02 Sep, 08:45 AM (Credited)'
  },
  {
    id: 'SETTL-2026-0831',
    date: '2026-08-31',
    theatre_name: 'Siva Cinemas',
    gross_revenue: 162500.0,
    tickets_online: 680,
    tickets_counter: 110,
    total_tickets: 790,
    platform_fee: 0.0,
    gst_collected: 29250.0,
    net_payout: 162500.0,
    status: 'TRANSFERRED',
    bank_account: 'SBI (A/C: ****29481)',
    bank_ref: 'UTR-SBIN8194018274',
    payout_time: '01 Sep, 09:12 AM (Credited)'
  }
];

const PartnerSettlementsPage = () => {
  const [selectedSettlement, setSelectedSettlement] = useState(SETTLEMENTS[0]);

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
            <ReceiptText className="w-4 h-4 text-[#D4AF37]" /> Automated Exhibitor Payouts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-display">
            Daily T+1 Settlements & Audit Statements
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Zero-deduction direct bank transfers for ticket revenues deposited every morning at 09:00 AM IST
          </p>
        </div>

        <button
          onClick={handlePrintAudit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] hover:border-[#D4AF37] text-xs font-black text-white transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print / Export Audit Statement</span>
        </button>
      </div>

      {/* 2. TODAY'S LIVE SETTLEMENT CARD (T+1 HIGHLIGHT) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1523]/80 border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-glow-gold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Settlement for Today (02 Sep 2026)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Processing T+1
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Bank Payout Scheduled: <strong className="text-white">Tomorrow (03 Sep 2026) at 09:00 AM IST</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black uppercase text-[#94A3B8] block">Net Payout Scheduled</span>
            <span className="text-2xl sm:text-3xl font-black text-[#D4AF37] font-display">
              ₹1,73,160.00
            </span>
          </div>
        </div>

        {/* Itemized Audit Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1">
            <span className="text-[#94A3B8] font-bold text-[11px] block">Gross Ticket Revenue</span>
            <span className="text-base font-black text-white">₹1,73,160</span>
            <p className="text-[10px] text-emerald-400 font-bold">100% Retained</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1">
            <span className="text-[#94A3B8] font-bold text-[11px] block">Tickets Sold</span>
            <span className="text-base font-black text-white">825 Tickets</span>
            <p className="text-[10px] text-slate-400">735 App + 90 Counter</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1">
            <span className="text-[#94A3B8] font-bold text-[11px] block">Platform Fee Deductions</span>
            <span className="text-base font-black text-emerald-400">₹0.00</span>
            <p className="text-[10px] text-emerald-400 font-bold">Zero Fee Guarantee</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080B10] border border-[#1E293B] space-y-1">
            <span className="text-[#94A3B8] font-bold text-[11px] block">Payout Account</span>
            <span className="text-base font-black text-[#D4AF37]">SBI ****29481</span>
            <p className="text-[10px] text-[#94A3B8]">IFSC: SBIN0000840</p>
          </div>
        </div>
      </div>

      {/* 3. SETTLEMENT HISTORY AUDIT TABLE */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white">Historical Daily Payouts & Statements</h3>

        <div className="rounded-3xl bg-[#0F1523]/80 overflow-hidden border border-[#1E293B] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080B10] border-b border-[#1E293B] text-[#94A3B8] font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Settlement ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Tickets (Online + Counter)</th>
                <th className="p-4">Gross Revenue</th>
                <th className="p-4">Net Paid Out</th>
                <th className="p-4">Status & UTR</th>
                <th className="p-4 text-right">Audit PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {SETTLEMENTS.map((s) => (
                <tr key={s.id} className="hover:bg-[#172033] transition-colors">
                  <td className="p-4 font-mono font-black text-[#D4AF37]">{s.id}</td>
                  <td className="p-4 font-bold text-white">{s.date}</td>
                  <td className="p-4">
                    <span className="font-bold text-white">{s.total_tickets}</span>{' '}
                    <span className="text-[#94A3B8]">({s.tickets_online} + {s.tickets_counter})</span>
                  </td>
                  <td className="p-4 font-bold">₹{s.gross_revenue.toLocaleString()}</td>
                  <td className="p-4 font-black text-emerald-400">₹{s.net_payout.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      s.status === 'TRANSFERRED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {s.status === 'TRANSFERRED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {s.status}
                    </span>
                    <span className="block text-[10px] font-mono text-[#94A3B8] mt-0.5">{s.bank_ref}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={handlePrintAudit}
                      className="p-2 rounded-xl bg-[#080B10] border border-[#1E293B] hover:border-[#D4AF37] text-[#D4AF37] hover:scale-110 transition-all inline-block cursor-pointer"
                      title="Download PDF statement"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartnerSettlementsPage;
