import React, { useEffect, useRef } from 'react';

interface GlyphParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  glyph: string;
  size: number;
  opacity: number;
  rotation: number;
  angularVelocity: number;
  life: number;
  maxLife: number;
}

const GLYPHS = ['·', '°', '⟡', '✦', '○', '+', '~', 'O₂', '☁'];

export const GlyphStream: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on desktop pointer devices, respect reduced motion
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: GlyphParticle[] = [];
    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Pour glyph stream
      const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
      if (dist > 3 && particles.length < 45) {
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 8,
          y: mouseY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.3 + Math.random() * 0.7, // gentle liquid downward drift
          glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '·',
          size: 9 + Math.random() * 5,
          opacity: 0.18 + Math.random() * 0.12, // extremely subtle branded opacity
          rotation: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.04,
          life: 0,
          maxLife: 35 + Math.random() * 25,
        });
      }
    };

    // Splash burst on click
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const splashCount = 7;

      for (let i = 0; i < splashCount; i++) {
        const angle = (Math.PI * 2 * i) / splashCount + (Math.random() - 0.5) * 0.4;
        const speed = 1.4 + Math.random() * 1.8;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '⟡',
          size: 11 + Math.random() * 4,
          opacity: 0.35,
          rotation: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.08,
          life: 0,
          maxLife: 28,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.angularVelocity;

        const progress = p.life / p.maxLife;
        const currentOpacity = p.opacity * (1 - progress);

        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // Electric Indigo #533afd with subtle opacity
        ctx.fillStyle = `rgba(83, 58, 253, ${Math.max(0, currentOpacity)})`;
        ctx.font = `${p.size}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
};
