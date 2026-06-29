import { useEffect, useRef } from 'react';

/**
 * CameraRain — droplets on the "lens", drawn to a DOM canvas over the scene.
 * A radial mask keeps the centre clear, so droplets never sit over the car.
 * Intensity follows tuning.weather.rain.
 */
export default function CameraRain({ tuning }) {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let w = 0;
    let h = 0;
    const drops = [];
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    let acc = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const intensity = (tuning.current.weather && tuning.current.weather.rain) || 0;

      acc += intensity * 55 * dt;
      while (acc > 1) {
        acc -= 1;
        const x = Math.random() * w;
        const y = Math.random() * h;
        const dxn = (x - w / 2) / (w / 2);
        const dyn = (y - h / 2) / (h / 2);
        if (Math.hypot(dxn, dyn) < 0.55 && Math.random() < 0.9) continue; // keep the centre clear
        drops.push({ x, y, r: 2 + Math.random() * 5, life: 1, vy: 5 + Math.random() * 16 });
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const dp = drops[i];
        dp.life -= dt * 0.32;
        dp.y += dp.vy * dt;
        if (dp.life <= 0) { drops.splice(i, 1); continue; }
        const a = Math.min(dp.life, 1) * 0.5;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205,222,255,${a * 0.5})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dp.x - dp.r * 0.3, dp.y - dp.r * 0.3, dp.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [tuning]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        maskImage: 'radial-gradient(circle at 50% 55%, transparent 0%, transparent 38%, black 76%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 55%, transparent 0%, transparent 38%, black 76%)',
      }}
    />
  );
}
