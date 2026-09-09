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
    <div className="space-y-8 animate-fade-in text-text-primary">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-1.5">
            <ReceiptText className="w-4 h-4 text-gold" /> Automated Exhibitor Payouts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mt-1 font-display">
            Daily T+1 Settlements & Audit Statements
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Zero-deduction direct bank transfers for ticket revenues deposited every morning at 09:00 AM IST
          </p>
        </div>

        <button
          onClick={handlePrintAudit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border hover:border-gold text-xs font-black text-text-primary transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gold" />
          <span>Print / Export Audit Statement</span>
        </button>
      </div>

      {/* 2. TODAY'S LIVE SETTLEMENT CARD (T+1 HIGHLIGHT) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-gold/30 shadow-sm relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gold/15 text-gold border border-gold/30 shadow-gold-glow">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-text-primary">Settlement for Today (02 Sep 2026)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Processing T+1
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Bank Payout Scheduled: <strong className="text-text-primary">Tomorrow (03 Sep 2026) at 09:00 AM IST</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black uppercase text-text-muted block">Net Payout Scheduled</span>
            <span className="text-2xl sm:text-3xl font-black text-gold font-display">
              ₹1,73,160.00
            </span>
          </div>
        </div>

        {/* Itemized Audit Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1">
            <span className="text-text-muted font-bold text-[11px] block">Gross Ticket Revenue</span>
            <span className="text-base font-black text-text-primary">₹1,73,160</span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Retained</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1">
            <span className="text-text-muted font-bold text-[11px] block">Tickets Sold</span>
            <span className="text-base font-black text-text-primary">825 Tickets</span>
            <p className="text-[10px] text-text-secondary">735 App + 90 Counter</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1">
            <span className="text-text-muted font-bold text-[11px] block">Platform Fee Deductions</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹0.00</span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Zero Fee Guarantee</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1">
            <span className="text-text-muted font-bold text-[11px] block">Payout Account</span>
            <span className="text-base font-black text-gold">SBI ****29481</span>
            <p className="text-[10px] text-text-muted">IFSC: SBIN0000840</p>
          </div>
        </div>
      </div>

      {/* 3. SETTLEMENT HISTORY AUDIT TABLE */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-text-primary">Historical Daily Payouts & Statements</h3>

        <div className="rounded-3xl bg-surface overflow-hidden border border-border shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated border-b border-border text-text-muted font-black uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-border text-text-secondary">
              {SETTLEMENTS.map((s) => (
                <tr key={s.id} className="hover:bg-surface-elevated transition-colors">
                  <td className="p-4 font-mono font-black text-gold">{s.id}</td>
                  <td className="p-4 font-bold text-text-primary">{s.date}</td>
                  <td className="p-4">
                    <span className="font-bold text-text-primary">{s.total_tickets}</span>{' '}
                    <span className="text-text-muted">({s.tickets_online} + {s.tickets_counter})</span>
                  </td>
                  <td className="p-4 font-bold text-text-primary">₹{s.gross_revenue.toLocaleString()}</td>
                  <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">₹{s.net_payout.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      s.status === 'TRANSFERRED'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {s.status === 'TRANSFERRED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {s.status}
                    </span>
                    <span className="block text-[10px] font-mono text-text-muted mt-0.5">{s.bank_ref}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={handlePrintAudit}
                      className="p-2 rounded-xl bg-surface-elevated border border-border hover:border-gold text-gold hover:scale-110 transition-all inline-block cursor-pointer"
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
