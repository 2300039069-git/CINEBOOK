import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          borderColor: 'border-emerald-500/30',
          bgGradient: 'from-emerald-950/40 via-surface-elevated/95 to-surface-elevated/95',
          glow: 'shadow-[0_4px_24px_-4px_rgba(16,185,129,0.25)]',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          progressColor: 'bg-emerald-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          borderColor: 'border-amber-500/30',
          bgGradient: 'from-amber-950/40 via-surface-elevated/95 to-surface-elevated/95',
          glow: 'shadow-[0_4px_24px_-4px_rgba(245,158,11,0.25)]',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          progressColor: 'bg-amber-500',
        };
      case 'conflict':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />,
          borderColor: 'border-rose-500/40',
          bgGradient: 'from-rose-950/50 via-surface-elevated/95 to-surface-elevated/95',
          glow: 'shadow-[0_8px_30px_-4px_rgba(229,9,20,0.35)]',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold',
          progressColor: 'bg-rose-500',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          borderColor: 'border-rose-500/30',
          bgGradient: 'from-rose-950/40 via-surface-elevated/95 to-surface-elevated/95',
          glow: 'shadow-[0_4px_24px_-4px_rgba(244,63,94,0.25)]',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          progressColor: 'bg-rose-500',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          borderColor: 'border-sky-500/30',
          bgGradient: 'from-sky-950/40 via-surface-elevated/95 to-surface-elevated/95',
          glow: 'shadow-[0_4px_24px_-4px_rgba(56,189,248,0.25)]',
          badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          progressColor: 'bg-sky-500',
        };
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.borderColor} bg-gradient-to-r ${config.bgGradient} backdrop-blur-xl p-4 text-white ${config.glow}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{config.icon}</div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm tracking-tight text-text-primary">
                      {toast.title}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed break-words">
                    {toast.message}
                  </p>
                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action.onClick();
                        removeToast(toast.id);
                      }}
                      className="mt-2 text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shimmer progress bar */}
              {toast.duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2px] ${config.progressColor}`}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
