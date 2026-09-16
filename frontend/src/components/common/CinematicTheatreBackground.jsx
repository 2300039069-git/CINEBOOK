import React, { useEffect, useRef, useState } from 'react';

// Curated high-performance 3D cinema auditorium and projector footage sources
const CINEMA_VIDEO_SOURCES = [
  '/cinema-bg.mp4',
  '/cinema-bg.mp4.mp4',
  '/theatre-bg.mp4',
  '/videos/theatre-bg.mp4',
  '/theatre.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-cinema-screen-in-an-empty-room-41554-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-projector-playing-a-movie-in-a-dark-room-41553-large.mp4'
];

const CinematicTheatreBackground = ({
  videoUrl,
  opacity = 0.32,
  showProjectorBeam = true,
  showParticles = true,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // 1. Hardware-Accelerated 3D Projector Light Rays & Floating Cinema Star Dust Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle physics (cinematic projector dust floating in light cone)
    const particleCount = Math.min(80, Math.floor(width / 20));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.1, // gently floating upward
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.005,
      color: Math.random() > 0.6 ? '#F59E0B' : Math.random() > 0.3 ? '#06B6D4' : '#FFFFFF'
    }));

    let beamAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Volumetric Projector Light Cone from Top-Center towards Bottom
      if (showProjectorBeam) {
        beamAngle += 0.008;
        const sourceX = width / 2;
        const sourceY = -20;
        const beamSpread = width * 0.7 + Math.sin(beamAngle) * 30;

        // Radial projector lens glow
        const lensGlow = ctx.createRadialGradient(sourceX, 10, 0, sourceX, 10, 180);
        lensGlow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        lensGlow.addColorStop(0.3, 'rgba(6, 182, 212, 0.2)');
        lensGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = lensGlow;
        ctx.beginPath();
        ctx.arc(sourceX, 10, 180, 0, Math.PI * 2);
        ctx.fill();

        // Volumetric Light Cone
        const coneGradient = ctx.createLinearGradient(sourceX, sourceY, sourceX, height * 0.85);
        coneGradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        coneGradient.addColorStop(0.15, 'rgba(245, 158, 11, 0.08)');
        coneGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
        coneGradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sourceX - 30, sourceY);
        ctx.lineTo(sourceX + 30, sourceY);
        ctx.lineTo(sourceX + beamSpread / 2, height);
        ctx.lineTo(sourceX - beamSpread / 2, height);
        ctx.closePath();
        ctx.fillStyle = coneGradient;
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw Floating Cinema Dust Particles
      if (showParticles) {
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.opacity += p.pulse;
          if (p.opacity > 0.9 || p.opacity < 0.2) p.pulse = -p.pulse;

          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showProjectorBeam, showParticles]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Layer 1: High-Definition 3D Cinema Auditorium / Laser Projector Looping Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.25] saturate-[1.2] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ opacity: videoLoaded ? opacity : 0 }}
          >
            {videoUrl && <source src={videoUrl} type="video/mp4" />}
            {CINEMA_VIDEO_SOURCES.map((src, i) => (
              <source key={i} src={src} type="video/mp4" />
            ))}
          </video>
        )}

        {/* 3D Seat Rows Depth Silhouette Backdrop (renders if video is loading/fallback) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 20%, rgba(245, 158, 11, 0.12) 0%, rgba(6, 182, 212, 0.05) 40%, rgba(9, 10, 14, 0.98) 85%)`
          }}
        />
      </div>

      {/* Layer 2: 3D Canvas Volumetric Projector Rays & Dust */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen will-change-transform"
      />

      {/* Layer 3: Ultra-Luxury Obsidian Cinema Stage Lighting & Vignette */}
      {/* Top Ambient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#F59E0B]/10 via-[#06B6D4]/5 to-transparent pointer-events-none" />
      
      {/* Side Vignettes for Content Focus */}
      <div className="absolute inset-y-0 left-0 w-32 sm:w-64 bg-gradient-to-r from-[#060709] via-[#060709]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 sm:w-64 bg-gradient-to-l from-[#060709] via-[#060709]/80 to-transparent pointer-events-none" />
      
      {/* Bottom Ground Blend */}
      <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-[#060709] via-[#060709]/90 to-transparent pointer-events-none" />

      {/* 3D Curved Silver Screen Top Indicator Glow */}
      <div className="absolute -top-12 inset-x-1/4 h-24 bg-gradient-to-b from-brand/25 via-cyan-400/10 to-transparent blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

export default CinematicTheatreBackground;
