import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * TiltCard — Physics-based 3D Card with cursor tracking and specular glare
 * @param {React.ReactNode} children
 * @param {string} className
 * @param {number} maxTilt - Maximum tilt angle in degrees (default 12)
 * @param {boolean} glare - Whether to render dynamic light sheen (default true)
 * @param {string} glowColor - Ambient glow color ('crimson' | 'gold' | 'cyan' | 'none')
 */
const TiltCard = ({
  children,
  className = '',
  maxTilt = 10,
  glare = true,
  glowColor = 'none',
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Motion values normalized between -1 and 1
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics
  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const glowClass = {
    crimson: 'hover:shadow-3d-card-hover group-hover:border-primary/50',
    gold: 'hover:shadow-3d-gold-hover group-hover:border-gold/50',
    cyan: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75),0_0_24px_-2px_rgba(6,182,212,0.3)] group-hover:border-cyan-imax/50',
    none: 'hover:shadow-card-hover'
  }[glowColor] || 'hover:shadow-card-hover';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={
        isMobile
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              perspective: 1000
            }
      }
      className={`relative group rounded-2xl transition-all duration-300 ${glowClass} ${className}`}
      {...props}
    >
      {/* Child elements rendered in 3D perspective context */}
      <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
        {children}

        {/* Dynamic Specular Glare Sheen Overlay */}
        {glare && !isMobile && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
            style={{
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 80%)`
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default TiltCard;
