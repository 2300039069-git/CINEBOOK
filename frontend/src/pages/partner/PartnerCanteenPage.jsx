import React, { useState } from 'react';
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Bell,
  Search,
  Check,
  TrendingUp,
  Sparkles,
  Phone,
  User,
  Coffee,
  DollarSign,
  AlertCircle,
  Plus
} from 'lucide-react';
import { INITIAL_CANTEEN_ORDERS, CANTEEN_MENU } from '../../data/mockData';

const PartnerCanteenPage = () => {
  const [orders, setOrders] = useState(INITIAL_CANTEEN_ORDERS);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, PENDING, PREPARING, DELIVERED_TO_SEAT
  const [searchQuery, setSearchQuery] = useState('');

  // Update order status
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = selectedFilter === 'ALL' || ord.status === selectedFilter;
    const matchesSearch =
      ord.seat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Analytics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED_TO_SEAT').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. HEADER & LIVE INTERVAL TIMER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4" /> Cinema F&B Service Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-display">
            Interval Canteen Pre-Order Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deliver pre-booked snacks, popcorn, and beverages directly to audience seats before interval lights turn on
          </p>
        </div>

        {/* Live Interval Bell Alert */}
        <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-[#D4AF37]/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-[#D4AF37] block tracking-wider">
              Interval Countdown
            </span>
            <span className="text-sm font-black text-white">Next Interval in 24 Mins (12:15 PM)</span>
          </div>
        </div>
      </div>

      {/* 2. CANTEEN METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl glass-card border border-[#D4AF37]/30 space-y-1">
          <span className="text-xs font-black uppercase text-slate-400">Total F&B Revenue</span>
          <h3 className="text-2xl font-black gradient-text-gold">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-400 font-bold">100% Theatre Direct Collection</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-amber-500/30 space-y-1">
          <span className="text-xs font-black uppercase text-slate-400">Orders Pending Prep</span>
          <h3 className="text-2xl font-black text-amber-400">{pendingCount} Orders</h3>
          <p className="text-[11px] text-amber-300">Needs immediate packing</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-cyan-500/30 space-y-1">
          <span className="text-xs font-black uppercase text-slate-400">In Kitchen / Tray</span>
          <h3 className="text-2xl font-black text-cyan-400">{preparingCount} Orders</h3>
          <p className="text-[11px] text-cyan-300">Being plated with hot samosas</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-emerald-500/30 space-y-1">
          <span className="text-xs font-black uppercase text-slate-400">Dispatched / Delivered</span>
          <h3 className="text-2xl font-black text-emerald-400">{deliveredCount} Orders</h3>
          <p className="text-[11px] text-emerald-300">Delivered to seat successfully</p>
        </div>
      </div>

      {/* 3. ORDER FILTER BAR & SEARCH */}
      <div className="p-4 rounded-3xl glass-panel border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Orders', count: orders.length },
            { id: 'PENDING', label: 'Pending', count: pendingCount },
            { id: 'PREPARING', label: 'Preparing', count: preparingCount },
            { id: 'DELIVERED_TO_SEAT', label: 'Delivered to Seat', count: deliveredCount }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedFilter === f.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 border-[#D4AF37] shadow-glow-gold'
                  : 'glass-card text-slate-300 hover:border-[#D4AF37]'
              }`}
            >
              <span>{f.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seat e.g. A5, C12..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* 4. ACTIVE ORDER FULFILLMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => {
          const isPending = order.status === 'PENDING';
          const isPreparing = order.status === 'PREPARING';
          const isDelivered = order.status === 'DELIVERED_TO_SEAT';

          return (
            <div
              key={order.id}
              className={`p-6 rounded-3xl glass-card space-y-4 border transition-all ${
                isPending
                  ? 'border-amber-500/40 bg-amber-500/[0.03]'
                  : isPreparing
                  ? 'border-cyan-500/40 bg-cyan-500/[0.03]'
                  : 'border-emerald-500/30 bg-emerald-500/[0.02]'
              }`}
            >
              {/* Card Header: Seat Pill & Token Ref */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-black text-sm shadow-md">
                    💺 SEAT {order.seat}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    ({order.tier})
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    isPending
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : isPreparing
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer details */}
              <div className="space-y-1 text-xs text-slate-300 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" /> {order.customerName}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {order.phone}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{order.time}</p>
              </div>

              {/* Itemized Snack Order List */}
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-200">
                    <span className="font-medium">
                      <strong className="text-[#D4AF37] mr-1.5">{item.qty}x</strong> {item.name}
                    </span>
                    <span className="font-bold text-white">₹{item.price}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10 flex justify-between font-black text-sm text-[#D4AF37]">
                  <span>Total Paid (Pre-Order):</span>
                  <span>₹{order.total}.00</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-1 flex items-center gap-2">
                {isPending && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    👨‍🍳 Mark Preparing
                  </button>
                )}

                {isPreparing && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED_TO_SEAT')}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deliver to Seat {order.seat}</span>
                  </button>
                )}

                {isDelivered && (
                  <div className="w-full py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Delivered to Seat {order.seat} ✓</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. QUICK MENU INVENTORY TOGGLE STRIP */}
      <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h3 className="text-base font-black text-white">Live Canteen Counter Menu (In Stock)</h3>
          <span className="text-xs text-[#D4AF37] font-bold">6 Items Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {CANTEEN_MENU.map((snk) => (
            <div key={snk.id} className="p-3.5 rounded-2xl glass-card text-center space-y-1.5 border border-white/[0.06]">
              <span className="text-2xl block">{snk.image}</span>
              <h4 className="font-bold text-white line-clamp-1">{snk.name}</h4>
              <span className="font-black text-[#D4AF37] block">₹{snk.price}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold block">
                In Stock
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerCanteenPage;
