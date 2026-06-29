import { useRef, useEffect, useCallback } from 'react';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * TextPressure — variable-font proximity effect.
 * Characters nearest the cursor get max weight/width/slant;
 * characters far away get min values.
 *
 * Uses Roboto Flex (wght 100–1000, wdth 25–151, slnt -10–0).
 */
export default function TextPressure({
  text = '',
  fontSize = 'clamp(32px, 5.5vw, 72px)',
  maxDistance = 280,
  minWeight = 100,
  maxWeight = 900,
  minWidth = 50,
  maxWidth = 151,
  minSlant = 0,
  maxSlant = -10,
  className = '',
  style = {},
}) {
  const charRefs = useRef([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef(null);

  const chars = text.split('');

  const tick = useCallback(() => {
    const { x: mx, y: my } = mouse.current;
    charRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dist = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
      const t = clamp(1 - dist / maxDistance, 0, 1);
      const wght = Math.round(lerp(minWeight, maxWeight, t));
      const wdth = Math.round(lerp(minWidth, maxWidth, t));
      const slnt = lerp(minSlant, maxSlant, t);
      el.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}, "slnt" ${slnt}`;
    });
    raf.current = requestAnimationFrame(tick);
  }, [maxDistance, minWeight, maxWeight, minWidth, maxWidth, minSlant, maxSlant]);

  useEffect(() => {
    const onMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [tick]);

  return (
    <span
      aria-label={text}
      className={className}
      style={{
        fontFamily: "'Roboto Flex', sans-serif",
        fontSize,
        display: 'inline-block',
        lineHeight: 0.95,
        ...style,
      }}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          ref={(el) => (charRefs.current[i] = el)}
          style={{
            display: 'inline-block',
            fontVariationSettings: `"wght" ${minWeight}, "wdth" ${minWidth}, "slnt" ${minSlant}`,
            transition: 'font-variation-settings 60ms linear',
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
