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
    'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-full';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] hover:from-[#ffffff] hover:to-[#e0b45c] text-[#171b34] font-bold shadow-[0_0_16px_rgba(224,180,92,0.55)] hover:shadow-[0_0_24px_rgba(224,180,92,0.75)]',
    glass:
      'bg-[#1e2348] hover:bg-[#262b52] text-white border border-white/10 hover:border-[#e0b45c] backdrop-blur-xl shadow-md',
    secondary:
      'bg-[#262b52] hover:bg-[#323868] text-white border border-white/10 hover:border-[#e0b45c]/50 shadow-sm',
    outline:
      'bg-transparent border border-[#e0b45c] hover:bg-[#e0b45c]/10 text-[#e0b45c]',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm',
    gold:
      'bg-gradient-to-r from-[#f6dd9c] via-[#e0b45c] to-[#b8862f] text-[#171b34] font-bold shadow-[0_0_16px_rgba(224,180,92,0.55)]',
  };

  const sizes = {
    xs: 'px-3 py-1 text-[11px] gap-1',
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-7 py-3 text-sm gap-2.5 uppercase tracking-wider',
    xl: 'px-8 py-3.5 text-base gap-3 uppercase tracking-wider font-extrabold',
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
