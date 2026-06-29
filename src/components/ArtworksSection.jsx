import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import ScrubVideo from './ScrubVideo';
import ImageTrail from './ImageTrail';
import TubesCursor from './TubesCursor';
import { ARTWORKS_VIDEO, ARTWORK_IMAGES, ARTWORKS_COPY } from '../data/artworks';

const EASE = [0.16, 1, 0.3, 1];

/**
 * ArtworksSection — interactive visual archive.
 *
 * Neon Tubes follow the cursor (the real cursor is hidden — the tubes ARE the
 * cursor). The llama backdrop still tracks the pointer, and the image trail
 * reveals the artworks as you move. Reduced-motion visitors get a still frame,
 * no trail, no tubes.
 *
 * Layering: z0 video · z10 scrims · z15 tubes (screen) · z20 trail · z30 label.
 */
export default function ArtworksSection() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();
  const [tubesOn, setTubesOn] = useState(false);

  // iOS WebKit won't paint a paused, seeked <video>, so on touch devices the
  // llama scrubs through a <canvas> (paintToCanvas) instead of the bare video.
  // Desktop keeps the direct-video scrub.
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const onChange = (e) => setCoarse(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const mode = reduced ? 'static' : 'scrub';
  const interactive = !reduced;

  // Mount the (GPU-heavy) tubes only once the section is near the viewport.
  useEffect(() => {
    if (reduced || !sectionRef.current) return undefined;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTubesOn(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <section
      id="artworks"
      ref={sectionRef}
      className={`relative w-full min-h-[100svh] touch-pan-y overflow-hidden bg-ink ${interactive ? 'cursor-none' : ''}`}
    >
      {/* z0 — llama backdrop. Delta scrub: move right -> llama plays forward,
          left -> backward; seeks chain on `seeked` so it stays glued to the
          pointer/finger. Touch devices render through a canvas (iOS won't paint
          a seeked <video>). */}
      <ScrubVideo
        src={ARTWORKS_VIDEO}
        targetRef={sectionRef}
        mode={mode}
        sensitivity={1.2}
        paintToCanvas={coarse}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center 28%' }}
      />

      {/* z10 — legibility vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[10]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 0%, rgba(10,9,8,0.30) 64%, rgba(10,9,8,0.80) 100%)',
        }}
      />
      {/* z10 — top blend into the previous chapter's ink */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[10] h-[36%] bg-gradient-to-b from-ink via-ink/80 to-transparent" />
      {/* z10 — bottom wash */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[10] h-[36%] bg-gradient-to-t from-ink/85 to-transparent" />

      {/* z15 — neon tubes cursor (mix-blend screen drops the black so they glow over the llama) */}
      {interactive && tubesOn && (
        <TubesCursor
          targetRef={sectionRef}
          className="pointer-events-none absolute inset-0 z-[15] h-full w-full mix-blend-screen"
        />
      )}

      {/* z20 — cursor / touch image trail */}
      {interactive && (
        <ImageTrail items={ARTWORK_IMAGES} variant={2} threshold={72} className="touch-pan-y" />
      )}

      {/* z30 — minimal page indicator (rule + small label) + hint, anchored upper-left */}
      <div className="pointer-events-none absolute inset-0 z-[30] flex flex-col justify-start">
        <div className="mx-auto w-full max-w-[1536px] px-5 pt-28 sm:px-8 md:px-10 md:pt-32">
          <motion.div
            className="flex items-center gap-4 sm:gap-5"
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.span
              className="block h-px origin-left bg-white/50"
              style={{ width: 'clamp(40px, 11vw, 150px)' }}
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.05 }}
            />
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.34em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-xs">
              {ARTWORKS_COPY.title}
            </span>
          </motion.div>

          <motion.p
            className="mt-3 max-w-xs font-sans text-sm font-light tracking-wide text-white/60 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            Show Lama the artworks by moving the cursor.
          </motion.p>
        </div>
      </div>

      {/* z40 — dark fade into the next chapter */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[40] h-40 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
    </section>
  );
}
