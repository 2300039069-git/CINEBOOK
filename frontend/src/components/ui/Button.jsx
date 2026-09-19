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
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] cursor-pointer';

  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 font-bold',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-semibold',
    md: 'text-sm px-4.5 py-2.5 gap-2 font-bold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-extrabold',
  };

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-hover text-white shadow-cta hover:shadow-[0_10px_25px_-3px_rgba(229,9,20,0.45)] focus:ring-primary border border-primary/30',
    gold:
      'bg-amber-500 hover:bg-amber-600 text-black font-extrabold shadow-cta-gold hover:shadow-[0_10px_25px_-3px_rgba(245,158,11,0.4)] focus:ring-amber-500 border border-amber-400/40',
    secondary:
      'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border hover:border-border/80 focus:ring-slate-500 shadow-xs',
    outline:
      'bg-transparent hover:bg-surface-elevated text-text-primary border border-border hover:border-primary/40 focus:ring-primary',
    ghost:
      'bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-text-primary focus:ring-slate-500',
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
