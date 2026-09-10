import React from 'react';

/**
 * GlassCard — Multi-tier frosted glass container with specular edge highlights
 * @param {React.ReactNode} children
 * @param {string} className
 * @param {string} variant - 'default' | 'elevated' | 'gold' | 'crimson' | 'interactive'
 */
const GlassCard = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-surface/80 dark:bg-surface/70 border-border/80 shadow-card backdrop-blur-xl',
    elevated: 'bg-surface-elevated/90 dark:bg-surface-elevated/80 border-border shadow-3d-card backdrop-blur-2xl',
    gold: 'bg-surface/80 border-gold/30 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.15)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xl',
    crimson: 'bg-surface/80 border-primary/30 shadow-[0_10px_30px_-5px_rgba(229,9,20,0.15)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xl',
    interactive: 'bg-surface/80 dark:bg-surface/70 border-border/80 hover:border-gold/40 hover:bg-surface-hover/90 transition-all duration-300 shadow-card hover:shadow-card-hover backdrop-blur-xl cursor-pointer'
  }[variant] || '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden ${variantStyles} ${className}`}
      {...props}
    >
      {/* Top Specular Bevel Highlight Line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export default GlassCard;
