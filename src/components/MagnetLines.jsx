import { useRef, useEffect } from 'react';

/**
 * MagnetLines — a grid of bars that rotate to point at the cursor.
 * Ported to JSX from the reference. Optimisations vs. the original:
 *   - line centres are measured ONCE (and on resize), not per pointermove,
 *     so we never thrash layout with 100+ getBoundingClientRect per frame;
 *   - pointer updates are rAF-throttled;
 *   - a short CSS transition smooths each rotation.
 */
export default function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = -10,
  className = '',
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return undefined;
    const items = Array.from(container.querySelectorAll('span'));
    let centers = [];

    const measure = () => {
      centers = items.map((it) => {
        const r = it.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
    };
    measure();

    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      for (let i = 0; i < items.length; i++) {
        const c = centers[i];
        const b = px - c.x;
        const a = py - c.y;
        const cc = Math.sqrt(a * a + b * b) || 1;
        const deg = ((Math.acos(b / cc) * 180) / Math.PI) * (py > c.y ? 1 : -1);
        items[i].style.setProperty('--rotate', `${deg.toFixed(1)}deg`);
      }
    };
    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onResize = () => measure();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);

    // initial aim: from the middle line
    if (centers.length) {
      const m = centers[Math.floor(centers.length / 2)];
      px = m.x;
      py = m.y - 1;
      apply();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [rows, columns]);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      className="block origin-center rounded-full"
      style={{
        backgroundColor: lineColor,
        width: lineWidth,
        height: lineHeight,
        '--rotate': `${baseAngle}deg`,
        transform: 'rotate(var(--rotate))',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}
    />
  ));

  return (
    <div
      ref={ref}
      className={`grid place-items-center ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style,
      }}
    >
      {spans}
    </div>
  );
}
