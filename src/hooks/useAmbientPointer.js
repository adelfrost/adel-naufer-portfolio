import { useEffect } from 'react';

/**
 * useAmbientPointer — when the real pointer is idle (or absent, as on touch
 * devices), drive a smooth automatic "pointer" across the target section by
 * dispatching synthetic `pointermove` events on document.body.
 *
 * Everything that already follows the pointer then animates on its own:
 *   • the neon tubes  — they listen on document.body for pointermove (the lib
 *     reads e.clientX/clientY), so they drift along the auto-path;
 *   • the llama scrub — it listens on window for pointermove, and the synthetic
 *     event bubbles body → document → window, so the llama follows the tubes.
 *
 * The instant a REAL (isTrusted) pointer move happens, the auto-path yields to
 * it. The path eases out of the last real position, so nothing ever jumps — and
 * because the tubes and the llama consume the SAME pointer, the llama always
 * looks toward wherever the tubes are wandering.
 *
 * This is also what brings the llama to life on mobile: with no mouse, the
 * section is permanently "idle", so the auto-path runs and a finger drag
 * (which fires real pointermove) scrubs it directly.
 */
const IDLE_MS = 1600;

export function useAmbientPointer(targetRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const body = document.body;

    let raf = 0;
    let lastActive = performance.now();
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let seed = null; // { x, y, t0 } captured when the idle period begins

    // Only REAL moves count as activity (ignore our own synthetic events).
    const onReal = (e) => {
      if (!e.isTrusted) return;
      lastActive = performance.now();
      lastX = e.clientX;
      lastY = e.clientY;
      seed = null;
    };
    body.addEventListener('pointermove', onReal, true); // capture phase

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - lastActive < IDLE_MS) return;            // user is active
      const el = targetRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) return; // off-screen

      if (!seed) seed = { x: lastX, y: lastY, t0: now };
      const t = (now - seed.t0) / 1000;                  // seconds since idle
      const ramp = Math.min(t / 1.3, 1);                 // ease amplitude in

      // Wander around the section centre, blending out from the seed position
      // so the first synthetic frame equals the last real one (no jump).
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.46;
      const baseX = seed.x + (cx - seed.x) * ramp;
      const baseY = seed.y + (cy - seed.y) * ramp;
      const ampX = r.width * 0.4 * ramp;
      const ampY = r.height * 0.2 * ramp;
      // Two incommensurate sines per axis → calm, non-repeating drift.
      const x = baseX + ampX * (0.7 * Math.sin(t * 0.55) + 0.3 * Math.sin(t * 0.23 + 1.3));
      const y = baseY + ampY * (0.6 * Math.sin(t * 0.4 + 0.7) + 0.4 * Math.sin(t * 0.74));

      body.dispatchEvent(new PointerEvent('pointermove', {
        clientX: x, clientY: y, bubbles: true, pointerType: 'mouse',
      }));
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      body.removeEventListener('pointermove', onReal, true);
    };
  }, [targetRef, enabled]);
}
