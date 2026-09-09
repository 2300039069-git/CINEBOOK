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
    <div className="space-y-8 animate-fade-in bg-background text-text-primary transition-colors">
      {/* 1. HEADER & LIVE INTERVAL TIMER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-amber-500" /> Cinema F&B Service Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Interval Canteen Pre-Order Fulfillment
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Deliver pre-booked snacks, popcorn, and beverages directly to audience seats before interval lights turn on
          </p>
        </div>

        {/* Live Interval Bell Alert */}
        <div className="px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-500 block tracking-wider">
              Interval Countdown
            </span>
            <span className="text-sm font-bold text-text-primary">Next Interval in 24 Mins (12:15 PM)</span>
          </div>
        </div>
      </div>

      {/* 2. CANTEEN METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-text-muted">Total F&B Revenue</span>
          <h3 className="text-2xl font-extrabold text-amber-500">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% Theatre Direct Collection</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-text-muted">Orders Pending Prep</span>
          <h3 className="text-2xl font-extrabold text-amber-500">{pendingCount} Orders</h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Needs immediate packing</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-text-muted">In Kitchen / Tray</span>
          <h3 className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{preparingCount} Orders</h3>
          <p className="text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">Being plated with hot samosas</p>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-border shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-text-muted">Dispatched / Delivered</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{deliveredCount} Orders</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-medium">Delivered to seat successfully</p>
        </div>
      </div>

      {/* 3. ORDER FILTER BAR & SEARCH */}
      <div className="p-4 rounded-3xl bg-surface border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
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
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedFilter === f.id
                  ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-amber-500 hover:text-text-primary'
              }`}
            >
              <span>{f.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-black/30">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seat e.g. A5, C12..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500"
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
              className={`p-6 rounded-3xl bg-surface space-y-4 border transition-all shadow-sm ${
                isPending
                  ? 'border-amber-500/40'
                  : isPreparing
                  ? 'border-cyan-500/40'
                  : 'border-emerald-500/30'
              }`}
            >
              {/* Card Header: Seat Pill & Token Ref */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500 text-black font-extrabold text-sm shadow-sm">
                    💺 SEAT {order.seat}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    ({order.tier})
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    isPending
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : isPreparing
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer details */}
              <div className="space-y-1 text-xs text-text-secondary pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" /> {order.customerName}
                  </span>
                  <span className="font-mono text-text-muted text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {order.phone}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">{order.time}</p>
              </div>

              {/* Itemized Snack Order List */}
              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-text-secondary">
                    <span className="font-medium">
                      <strong className="text-amber-500 mr-1.5">{item.qty}x</strong> {item.name}
                    </span>
                    <span className="font-bold text-text-primary">₹{item.price}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex justify-between font-extrabold text-sm text-amber-500">
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
                    className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    👨‍🍳 Mark Preparing
                  </button>
                )}

                {isPreparing && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED_TO_SEAT')}
                    className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deliver to Seat {order.seat}</span>
                  </button>
                )}

                {isDelivered && (
                  <div className="w-full py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-center flex items-center justify-center gap-1.5">
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
      <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-base font-bold text-text-primary">Live Canteen Counter Menu (In Stock)</h3>
          <span className="text-xs text-amber-500 font-bold">6 Items Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {CANTEEN_MENU.map((snk) => (
            <div key={snk.id} className="p-3.5 rounded-2xl bg-surface-elevated text-center space-y-1.5 border border-border shadow-sm">
              <span className="text-2xl block">{snk.image}</span>
              <h4 className="font-bold text-text-primary line-clamp-1">{snk.name}</h4>
              <span className="font-extrabold text-amber-500 block">₹{snk.price}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold block border border-emerald-500/20">
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

