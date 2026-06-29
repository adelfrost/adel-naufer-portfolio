import { useCallback, useEffect, useRef } from 'react';
import './GlowingEffect.css';

/**
 * GlowingEffect — drop inside a `relative` rounded container. A gradient border
 * ring lights up and its bright arc rotates to point at the cursor whenever the
 * pointer comes within `proximity` of the element.
 *
 * Perf: the element's rect is cached (refreshed on scroll/resize), so the global
 * pointermove handler only does a cheap cached-bounds test and bails early when
 * the cursor is far — no per-move layout reads, no rAF. An IntersectionObserver
 * detaches the listeners entirely while the card is off-screen.
 */
export function GlowingEffect({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  glow = false,
  className = '',
  disabled = false,
  borderWidth = 1,
}) {
  const ref = useRef(null);
  const rectRef = useRef(null);
  const last = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const angle = useRef(0);

  const readRect = useCallback(() => {
    rectRef.current = ref.current ? ref.current.getBoundingClientRect() : null;
  }, []);

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      const rect = rectRef.current;
      if (!el || !rect) return;
      const mx = e ? e.clientX : last.current.x;
      const my = e ? e.clientY : last.current.y;
      if (e) last.current = { x: mx, y: my };

      // Cheap gate against the CACHED rect — no layout read, no rAF when far.
      const m = proximity + 40;
      const near =
        mx > rect.left - m && mx < rect.right + m && my > rect.top - m && my < rect.bottom + m;
      if (!near) {
        if (el.style.getPropertyValue('--active') !== '0') el.style.setProperty('--active', '0');
        return;
      }

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const node = ref.current;
        const r = rectRef.current;
        if (!node || !r) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        const inactiveR = 0.5 * Math.min(r.width, r.height) * inactiveZone;
        if (dist < inactiveR) {
          node.style.setProperty('--active', '0');
          return;
        }
        const active =
          mx > r.left - proximity &&
          mx < r.right + proximity &&
          my > r.top - proximity &&
          my < r.bottom + proximity;
        node.style.setProperty('--active', active ? '1' : '0');
        if (!active) return;

        const target = (Math.atan2(my - cy, mx - cx) * 180) / Math.PI + 90;
        let cur = angle.current;
        const diff = ((target - cur + 540) % 360) - 180;
        cur += diff;
        angle.current = cur;
        node.style.setProperty('--start', String(cur));
      });
    },
    [inactiveZone, proximity]
  );

  useEffect(() => {
    const el = ref.current;
    if (disabled || !el) return undefined;

    let listening = false;
    const move = (ev) => handleMove(ev);
    const onScroll = () => { readRect(); handleMove(); };
    const onResize = () => readRect();

    const attach = () => {
      if (listening) return;
      listening = true;
      readRect();
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
    };
    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      el.style.setProperty('--active', '0');
    };

    // Only burn cycles while the card is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
      { rootMargin: '120px' }
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf.current);
      io.disconnect();
      detach();
    };
  }, [handleMove, readRect, disabled]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`glow-effect ${glow ? 'glow-effect--glow' : ''} ${className}`}
      style={{
        '--blur': `${blur}px`,
        '--spread': spread,
        '--border-width': `${borderWidth}px`,
        '--start': '0',
        '--active': '0',
      }}
    />
  );
}

export default GlowingEffect;
