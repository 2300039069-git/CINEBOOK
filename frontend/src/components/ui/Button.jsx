import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-hover text-white shadow-cta hover:shadow-[0_12px_28px_-4px_rgba(229,9,20,0.55)] focus:ring-primary border border-primary/20',
    gold:
      'bg-accent hover:bg-accent-hover text-background font-semibold shadow-cta-gold hover:shadow-[0_12px_28px_-4px_rgba(212,175,55,0.5)] focus:ring-accent border border-accent/30',
    secondary:
      'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border hover:border-border/80 focus:ring-slate-500 shadow-sm',
    outline:
      'bg-transparent hover:bg-surface-elevated/80 text-text-primary border border-border hover:border-text-muted focus:ring-slate-500',
    ghost:
      'bg-transparent hover:bg-surface-elevated/60 text-text-secondary hover:text-text-primary focus:ring-slate-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md focus:ring-rose-500 border border-rose-500/30',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
          <span>{typeof children === 'string' ? 'Processing...' : children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
