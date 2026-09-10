import React from 'react';

/**
 * GradientButton — Tactile 3D Button with specular top reflection & glowing hover states
 * @param {React.ReactNode} children
 * @param {string} variant - 'crimson' | 'gold' | 'glass' | 'secondary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const GradientButton = ({
  children,
  variant = 'crimson',
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon,
  onClick,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5 font-extrabold'
  }[size] || sizeStyles.md;

  const variantStyles = {
    crimson:
      'bg-gradient-to-b from-primary-light to-primary hover:from-primary hover:to-primary-hover text-white shadow-cta hover:shadow-glow-crimson border border-white/20 active:translate-y-[1px]',
    gold:
      'bg-gradient-to-b from-[#F5C542] via-[#D4AF37] to-[#B89628] hover:from-[#FAD55C] hover:to-[#D4AF37] text-black font-extrabold shadow-cta-gold hover:shadow-glow-gold border border-white/30 active:translate-y-[1px]',
    glass:
      'bg-surface-elevated/80 hover:bg-surface-hover/90 text-text-primary border border-white/10 hover:border-white/25 shadow-card hover:shadow-card-hover backdrop-blur-xl active:translate-y-[1px]',
    secondary:
      'bg-surface-elevated hover:bg-surface border border-border hover:border-gold/50 text-text-primary shadow-sm hover:shadow-md active:translate-y-[1px]'
  }[variant] || variantStyles.crimson;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none overflow-hidden group ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {/* Specular Top Shine Line */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {Icon && <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default GradientButton;
