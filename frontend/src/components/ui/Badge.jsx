import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'primary' | 'gold' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'glass'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  dot = false,
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center font-extrabold uppercase tracking-wider select-none shrink-0 transition-all';

  const variants = {
    default:
      'bg-surface-elevated text-text-secondary border border-border',
    primary:
      'bg-primary/10 text-primary border border-primary/30',
    gold:
      'bg-accent/15 text-accent border border-accent/30',
    emerald:
      'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30',
    amber:
      'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30',
    rose:
      'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30',
    cyan:
      'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30',
    glass:
      'bg-white/10 dark:bg-white/5 text-text-primary border border-white/15 backdrop-blur-md',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[9px] gap-1 rounded-md',
    md: 'px-2.5 py-0.5 text-[10px] gap-1.5 rounded-lg',
    lg: 'px-3 py-1 text-xs gap-2 rounded-xl',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            variant === 'emerald'
              ? 'bg-emerald-500 animate-pulse'
              : variant === 'amber'
              ? 'bg-amber-500 animate-pulse'
              : variant === 'rose'
              ? 'bg-rose-500'
              : variant === 'primary'
              ? 'bg-primary animate-pulse'
              : 'bg-accent'
          }`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
