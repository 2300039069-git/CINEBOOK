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
      'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] hover:from-[#FFD066] hover:to-[#FFE599] text-[#0B0E14] font-black shadow-[0_0_18px_rgba(229,169,60,0.45)] hover:shadow-[0_0_28px_rgba(229,169,60,0.65)] border border-[#FFD066]',
    glass:
      'bg-[#121824]/80 hover:bg-[#1A2234] text-white border border-[#E5A93C]/30 hover:border-[#E5A93C] backdrop-blur-xl shadow-md hover:shadow-[0_0_15px_rgba(229,169,60,0.25)]',
    secondary:
      'bg-[#1A2234] hover:bg-[#222C42] text-white border border-[#E5A93C]/20 hover:border-[#E5A93C]/50 shadow-sm',
    outline:
      'bg-transparent border border-[#E5A93C]/40 hover:border-[#E5A93C] text-slate-200 hover:text-[#FFD066]',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm',
    gold:
      'bg-gradient-to-r from-[#E5A93C] to-[#FFD066] hover:from-[#FFD066] hover:to-[#FFE599] text-[#0B0E14] font-black shadow-[0_0_18px_rgba(229,169,60,0.45)] border border-[#FFD066]',
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
