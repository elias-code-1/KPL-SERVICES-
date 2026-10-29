import { useEffect, useRef } from 'react';

interface SnowEffectProps {
  density?: number;
  color?: string;
}

export function SnowEffect({ density = 35 }: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialisation des flocons
    const particles = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.8 + 1,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.6 + 0.3,
      isGold: Math.random() > 0.8, // 20% d'éclats dorés pour rappeler l'identité chic KPL
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isGold
          ? `rgba(212, 175, 55, ${p.opacity})` // Doré
          : `rgba(255, 255, 255, ${p.opacity})`; // Blanc neige
        ctx.shadowBlur = p.isGold ? 6 : 3;
        ctx.shadowColor = p.isGold ? '#D4AF37' : '#ffffff';
        ctx.fill();

        // Mouvement
        p.y += p.speedY;
        p.x += p.speedX;

        // Boucle quand le flocon sort de l'écran
        if (p.y > height) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
