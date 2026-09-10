import React from 'react';

/**
 * AmbientGlow — Atmospheric gradient mesh & stage spotlights for cinematic depth
 * @param {string} variant - 'crimson' | 'gold' | 'cinema' | 'cyan'
 */
const AmbientGlow = ({
  variant = 'cinema',
  className = '',
  intensity = 'medium'
}) => {
  const opacity = {
    subtle: 'opacity-30',
    medium: 'opacity-50',
    intense: 'opacity-75'
  }[intensity] || 'opacity-50';

  const glowStyles = {
    cinema: 'bg-gradient-to-r from-primary/15 via-gold/10 to-cyan-imax/10 filter blur-[90px]',
    crimson: 'bg-gradient-to-br from-primary/25 via-primary/10 to-transparent filter blur-[100px]',
    gold: 'bg-gradient-to-br from-gold/25 via-amber-500/10 to-transparent filter blur-[100px]',
    cyan: 'bg-gradient-to-br from-cyan-imax/20 via-blue-500/10 to-transparent filter blur-[100px]'
  }[variant] || glowStyles.cinema;

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full ${glowStyles} ${opacity} ${className}`}
    />
  );
};

export default AmbientGlow;
