import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'glass' | 'secondary' | 'outline' | 'danger' | 'gold'
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-xl';

  const variants = {
    primary:
      'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 border border-primary/40 hover:shadow-primary/40',
    glass:
      'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 text-text-primary border border-white/15 dark:border-white/10 backdrop-blur-xl shadow-md',
    secondary:
      'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border shadow-sm',
    outline:
      'bg-transparent border border-border hover:border-primary/60 text-text-primary hover:text-primary',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-sm',
    gold:
      'bg-accent hover:bg-accent-hover text-black font-extrabold shadow-lg shadow-accent/25 border border-accent/40',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-5 py-2.5 text-xs gap-2 rounded-xl',
    lg: 'px-7 py-3 text-sm gap-2.5 rounded-xl uppercase tracking-wider',
    xl: 'px-8 py-3.5 text-base gap-3 rounded-2xl uppercase tracking-wider font-extrabold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
