import { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'motion/react';
import MagnetLines from './MagnetLines';
import { PRELOAD_VIDEOS } from '../data/preload';

const EASE = [0.16, 1, 0.3, 1];

/**
 * LoadingScreen — full-page intro. A MagnetLines field reacts to the cursor
 * behind a lamp-style glowing progress bar.
 *
 * It buffers EVERY full-viewport background video (via real <video> elements,
 * so it works for the cross-origin contact clip too) and only reveals the site
 * once they can all play through. That way a slow connection never lands on the
 * page with missing backdrops. A hard safety cap still fires so one stalled or
 * failed asset can never hang the intro forever.
 */
export default function LoadingScreen() {
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const progress = useMotionValue(0);
  const barWidth = useTransform(progress, (v) => `${Math.min(100, v * 100)}%`);
  const glowWidth = useTransform(progress, (v) => `${Math.min(100, v * 100)}%`);
  const pctText = useTransform(progress, (v) => `${Math.round(Math.min(100, v * 100))}%`);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock scroll while loading

    const start = performance.now();
    let done = false;
    let cancelled = false;
    let readyTimer = 0;
    let hideTimer = 0;
    let raf = 0;

    const finish = () => {
      if (done) return;
      done = true;
      const minShow = reduced ? 350 : 1100;
      const wait = Math.max(0, minShow - (performance.now() - start));
      readyTimer = setTimeout(() => {
        animate(progress, 1, { duration: reduced ? 0.2 : 0.42, ease: EASE }); // cosmetic top-up
        hideTimer = setTimeout(() => setHidden(true), reduced ? 220 : 560);
      }, wait);
    };

    // ── Buffer every backdrop video; track per-video readiness ──────────────
    const n = PRELOAD_VIDEOS.length;
    const ready = new Array(n).fill(false);
    const timers = [];
    const vids = PRELOAD_VIDEOS.map((url, i) => {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true;
      // NB: no crossOrigin — plain playback/buffering needs no CORS, and setting
      // it would break the cross-origin clip if the CDN omits CORS headers.
      v.src = url;
      const markReady = () => { ready[i] = true; };
      v.addEventListener('canplaythrough', markReady, { once: true });
      v.addEventListener('error', markReady, { once: true });     // never block on failure
      timers.push(setTimeout(markReady, reduced ? 4000 : 45000)); // per-asset stall release
      try { v.load(); } catch (_) {}
      return v;
    });

    const setBar = () => {
      let sum = 0;
      for (let i = 0; i < n; i += 1) {
        if (ready[i]) { sum += 1; continue; }
        const v = vids[i];
        const d = v.duration;
        if (d && Number.isFinite(d) && v.buffered.length) {
          sum += Math.min(v.buffered.end(v.buffered.length - 1) / d, 1);
        }
      }
      const avg = sum / (n || 1);
      progress.set(Math.min(avg, 1) * 0.96); // hold the last sliver for finish()
      if (!cancelled && ready.every(Boolean)) finish();
    };

    const poll = () => { raf = requestAnimationFrame(poll); setBar(); };
    raf = requestAnimationFrame(poll);

    // Hard safety net: generous on a slow line, but never an infinite hang.
    const cap = setTimeout(finish, reduced ? 2500 : 150000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(cap);
      clearTimeout(readyTimer);
      clearTimeout(hideTimer);
      timers.forEach(clearTimeout);
      vids.forEach((v) => { try { v.removeAttribute('src'); v.load(); } catch (_) {} });
      document.body.style.overflow = prevOverflow;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hidden) document.body.style.overflow = '';
  }, [hidden]);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* MagnetLines field (cursor-reactive) */}
          {!reduced && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-50">
              <MagnetLines
                rows={11}
                columns={19}
                containerSize="120vmax"
                lineColor="rgba(196,181,253,0.5)"
                lineWidth="2px"
                lineHeight="34px"
                baseAngle={0}
              />
            </div>
          )}

          {/* soft vignette so the centre copy reads over the field */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,9,8,0.2),rgba(10,9,8,0.85))]" />

          {/* centre: brand + glowing lamp bar */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6">
            <motion.div
              className="text-center"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ADEL NAUFER
              </div>
              <div className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
                Designer · Art Director
              </div>
            </motion.div>

            {/* lamp-style glowing bar */}
            <div className="relative w-[min(72vw,360px)]">
              {/* diffuse violet halo following the fill */}
              <motion.div
                className="absolute -top-3 left-0 h-9 rounded-full bg-violet-500/25 blur-2xl"
                style={{ width: glowWidth }}
              />
              {/* track */}
              <div className="relative h-[3px] w-full overflow-visible rounded-full bg-white/10">
                {/* fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 to-violet-200"
                  style={{
                    width: barWidth,
                    boxShadow: '0 0 18px 4px rgba(196,181,253,0.5)',
                  }}
                />
              </div>
              {/* percentage + label */}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/35">
                  Loading
                </span>
                <motion.span className="font-sans text-[11px] font-medium tabular-nums text-white/55">
                  {pctText}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
