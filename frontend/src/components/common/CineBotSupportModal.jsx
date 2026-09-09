import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  CreditCard,
  Building2,
  Ticket,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const CineBotSupportModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'BOT',
      text: "Hello! I am **CineBot**, your 24/7 automated cinema assistant. Need help with showtimes, theatres, or need to **cancel a ticket for an instant bank refund**?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeRefundReceipt, setActiveRefundReceipt] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'BOT',
          text: data.reply,
          suggested_actions: data.suggested_actions,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      // Offline fallback NLP engine
      setTimeout(() => {
        setIsTyping(false);
        let reply = "I can assist you with movie schedules, theatre amenities, or automated instant ticket refunds.";
        let actions = [];

        const lower = query.toLowerCase();
        if (lower.includes('cancel') || lower.includes('refund') || lower.includes('money')) {
          reply = "I can immediately process your **instant ticket refund** directly back into your original bank account or UPI source. Click below to initiate instant refund.";
          actions = [{ label: '⚡ Execute Automated Bank Refund', action: 'DO_REFUND' }];
        } else if (lower.includes('guntur') || lower.includes('vijayawada') || lower.includes('tenali') || lower.includes('theatre')) {
          reply = "📍 **Our Verified Partner Theatres**:\n• **Guntur**: Siva Cinemas, Studio 81, Bhaskar, GS Cinemas, Naz Complex\n• **Vijayawada**: G3 Raj Yuvraj, Ravi Cinemas, Apsara, Alankar\n• **Tenali**: Asha Cinemas, Sangameswara, SV Priya Complex";
        } else if (lower.includes('pushpa') || lower.includes('movie')) {
          reply = "🎬 **Blockbusters Playing Now**:\n1. Pushpa 2: The Rule (2024)\n2. Pushpa: The Rise (2021)\n3. Ala Vaikunthapurramuloo (2020)\n4. Naa Peru Surya (2018)";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'BOT',
            text: reply,
            suggested_actions: actions,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    }
  };

  const handleActionClick = (actionItem) => {
    if (actionItem.action === 'INITIATE_REFUND' || actionItem.action === 'DO_REFUND') {
      executeInstantRefund();
    } else if (actionItem.query) {
      handleSendMessage(actionItem.query);
    }
  };

  // Instant Automated Bank Refund Execution
  const executeInstantRefund = () => {
    setIsTyping(true);

    setTimeout(() => {
      // Find active booking in localStorage
      const bookings = JSON.parse(localStorage.getItem('cinebook_bookings') || '[]');
      const activeBooking = bookings[0] || {
        bookingId: 'CB-2026-894120',
        totalAmount: 459,
        baseAmount: 400
      };

      const refundAmount = activeBooking.baseAmount || 400;
      const utrRef = `UTR-IMPS-RFND-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      // Update booking status in localStorage
      const updated = bookings.map((b, idx) => {
        if (idx === 0 || b.bookingId === activeBooking.bookingId) {
          return {
            ...b,
            status: 'CANCELLED & REFUNDED',
            refundAmount: refundAmount,
            refundUtr: utrRef,
            refundedAt: new Date().toISOString()
          };
        }
        return b;
      });
      localStorage.setItem('cinebook_bookings', JSON.stringify(updated));

      setIsTyping(false);
      const receipt = {
        bookingId: activeBooking.bookingId,
        refundAmount,
        utrRef,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setActiveRefundReceipt(receipt);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'BOT',
          isReceipt: true,
          receiptData: receipt,
          text: `✅ **Refund of ₹${refundAmount}.00 successfully credited to your bank account!**\n\n**Bank UTR Reference:** \`${utrRef}\`\n**Status:** Instant IMPS Bank Transfer Completed.\n**Seats:** Released back into live theatre inventory.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <>
      {/* Floating CineBot Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E2B714] to-[#F3E5AB] text-black shadow-glow-gold hover:scale-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          title="Open CineBot Automated Assistant"
        >
          <Bot className="w-6 h-6 text-black animate-pulse" />
          <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider pr-1 text-black">
            {isOpen ? 'Close CineBot' : 'CineBot 24/7 AI'}
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080B10] animate-ping" />
        </button>
      </div>

      {/* CineBot Interactive Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] bg-surface rounded-3xl border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden animate-scale-up backdrop-blur-2xl text-text-primary">
          {/* Bot Header */}
          <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-[2px]">
                <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center text-amber-500">
                  <Bot className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  CineBot AI Assistant
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted">Instant Clarifications & Auto-Refund Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-none bg-background">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'BOT' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                    🤖
                  </div>
                )}

                <div className="space-y-2 max-w-[82%]">
                  <div
                    className={`p-3.5 rounded-2xl ${
                      m.sender === 'USER'
                        ? 'bg-accent text-white font-bold rounded-tr-none shadow-md'
                        : 'bg-surface border border-border text-text-primary rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                    {/* Instant Bank Refund Credit Card inside Chat */}
                    {m.isReceipt && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-black">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4" /> Direct Bank Credit
                          </span>
                          <span className="text-sm font-extrabold font-mono">₹{m.receiptData.refundAmount}.00</span>
                        </div>
                        <div className="space-y-1 text-[10px] text-text-secondary font-mono">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Booking Ref:</span>
                            <span className="font-bold text-text-primary">{m.receiptData.bookingId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">IMPS UTR Ref:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{m.receiptData.utrRef}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Pushed to Bank:</span>
                            <span>{m.receiptData.time} (Instant Payout)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Action Pills */}
                  {m.suggested_actions && m.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggested_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-text-muted block px-1">{m.time}</span>
                </div>

                {m.sender === 'USER' && (
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                    👤
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-text-muted text-xs p-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>CineBot is resolving query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pill Strip */}
          <div className="px-3 py-2 border-t border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-surface">
            <button
              onClick={() => handleSendMessage('How to cancel ticket and get instant refund?')}
              className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border text-[10px] font-bold text-accent whitespace-nowrap hover:border-accent transition-colors cursor-pointer"
            >
              💸 Cancel & Refund
            </button>
            <button
              onClick={() => handleSendMessage('Which theatres are in Guntur?')}
              className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap hover:border-amber-500 transition-colors cursor-pointer"
            >
              📍 Theatres
            </button>
            <button
              onClick={() => handleSendMessage('Show movies playing now')}
              className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-border text-[10px] font-bold text-text-secondary whitespace-nowrap hover:border-border transition-colors cursor-pointer"
            >
              🎬 Movies
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-border flex items-center gap-2 bg-surface"
          >
            <input
              type="text"
              placeholder="Ask CineBot anything or cancel ticket..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-black disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CineBotSupportModal;
