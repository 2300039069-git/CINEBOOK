import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'primary' | 'gold' | 'success' | 'warning' | 'danger' | 'imax' | 'outline'
  size = 'md', // 'sm' | 'md'
  className = '',
  icon = null,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md tracking-wide select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold uppercase',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    default: 'bg-surface-elevated text-text-secondary border border-border/80',
    primary: 'bg-primary/10 text-primary border border-primary/20 font-semibold',
    gold: 'bg-accent/10 text-accent border border-accent/30 font-semibold',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    imax: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider',
    outline: 'bg-transparent text-text-muted border border-border',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
