import { useEffect, useRef } from 'react';

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

/**
 * TubesCursor — neon 3D tubes that follow the cursor (threejs-components,
 * loaded from CDN at runtime). The canvas uses mix-blend-mode:screen so its
 * black background drops out and only the glowing tubes overlay whatever sits
 * behind. Clicking inside `targetRef` randomizes the colours.
 *
 * Concept & lib by Kevin Levron (threejs-components).
 */
export default function TubesCursor({ targetRef, className = '', enableClick = true }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let onClick;

    (async () => {
      if (!canvasRef.current) return;
      try {
        const mod = await import(
          /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        const TubesCursorFn = mod.default;
        if (!mounted || !canvasRef.current) return;

        appRef.current = TubesCursorFn(canvasRef.current, {
          tubes: {
            colors: ['#f967fb', '#53bc28', '#6958d5'],
            lights: {
              intensity: 200,
              colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
            },
          },
        });

        if (enableClick) {
          const target = targetRef?.current || window;
          onClick = (e) => {
            // only randomize for clicks inside the host (when a target is given)
            if (targetRef?.current && !targetRef.current.contains(e.target)) return;
            const app = appRef.current;
            app?.tubes?.setColors?.(randomColors(3));
            app?.tubes?.setLightsColors?.(randomColors(4));
          };
          target.addEventListener('click', onClick);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('TubesCursor: failed to load', e);
      }
    })();

    return () => {
      mounted = false;
      const target = targetRef?.current || window;
      if (onClick) target.removeEventListener('click', onClick);
      try {
        appRef.current?.destroy?.();
        appRef.current?.dispose?.();
      } catch (e) {
        /* ignore */
      }
      appRef.current = null;
    };
  }, [targetRef, enableClick]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ touchAction: 'none' }}
    />
  );
}
