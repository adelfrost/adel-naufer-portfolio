import { useEffect, useRef } from 'react';

/**
 * CardCanvasReveal — a lightweight Canvas2D dot-matrix that twinkles in
 * blue→violet while `active`. This stands in for the reference's three.js
 * CanvasRevealEffect so we don't add @react-three/fiber + three (a heavy,
 * always-mounted WebGL context) for one hover card. It only runs the rAF loop
 * while hovered, so it costs nothing at rest.
 */
export default function CardCanvasReveal({ active, className = '', gap = 11, dotSize = 2 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let seeds = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
      seeds = new Array(cols * rows).fill(0).map(() => Math.random());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const BLUE = [59, 130, 246];
    const VIOLET = [139, 92, 246];

    const draw = (t) => {
      const time = (t - startRef.current) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const s = seeds[i];
          // sparse pseudo-random twinkle
          const tw = 0.5 + 0.5 * Math.sin(time * 0.9 + s * 12.0);
          if (tw <= 0.6) continue;
          const on = (tw - 0.6) / 0.4;
          const r = (BLUE[0] + (VIOLET[0] - BLUE[0]) * s) | 0;
          const g = (BLUE[1] + (VIOLET[1] - BLUE[1]) * s) | 0;
          const b = (BLUE[2] + (VIOLET[2] - BLUE[2]) * s) | 0;
          ctx.fillStyle = `rgba(${r},${g},${b},${(on * 0.85).toFixed(3)})`;
          ctx.fillRect(x * gap, y * gap, dotSize, dotSize);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [active, gap, dotSize]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
