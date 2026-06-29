import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import GradualBlur from './GradualBlur';
import CircularGallery from './CircularGallery';
import { VIDEOS } from '../data/videos';

const EASE = [0.16, 1, 0.3, 1];
const BG_VIDEO = '/videos/videos-bg-scrub.mp4';

export default function VideosSection() {
  const reduced = useReducedMotion();

  const items = useMemo(() => VIDEOS.map((v) => ({ image: v.poster, text: v.text })), []);

  const controlsRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const draggingRef = useRef(false);

  // Background scrub video — its playhead follows the gallery's scroll position.
  const bgRef = useRef(null);
  const bgState = useRef({ ready: false, duration: 0, lastT: -1 });

  const [active, setActive] = useState(null);
  // Lazy: don't fetch the 6 MB backdrop until the section nears the viewport.
  const [bgNear, setBgNear] = useState(false);
  useEffect(() => {
    const v = bgRef.current;
    if (!v || bgNear) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setBgNear(true); },
      { rootMargin: '800px 0px' }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [bgNear]);

  useEffect(() => {
    const v = bgRef.current;
    if (!v) return;
    let cancelled = false;
    const warm = () => {
      const p = v.play();
      if (p && typeof p.then === 'function') p.then(() => { if (!cancelled) v.pause(); }).catch(() => {});
    };
    const onMeta = () => {
      bgState.current.duration = v.duration || 0;
      bgState.current.ready = bgState.current.duration > 0 && Number.isFinite(bgState.current.duration);
      warm();
    };
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('loadeddata', warm);
    v.addEventListener('canplay', warm);
    if (v.readyState >= 1) onMeta();
    return () => {
      cancelled = true;
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('loadeddata', warm);
      v.removeEventListener('canplay', warm);
    };
  }, []);

  // Gallery scroll -> (1) move the scrollbar thumb, (2) scrub the bg video.
  const onProgress = useCallback((p) => {
    // scrollbar thumb (direct DOM, no re-render)
    if (!draggingRef.current) {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (track && thumb) {
        const max = track.clientWidth - thumb.clientWidth;
        thumb.style.transform = `translateX(${(p * max).toFixed(2)}px)`;
      }
    }
    // bg video scrub — all-intra source seeks instantly, so this is smooth
    const bg = bgRef.current;
    const st = bgState.current;
    if (bg && st.ready) {
      const t = Math.min(Math.max(p * st.duration, 0), st.duration - 0.05);
      if (Math.abs(t - st.lastT) > 0.02) {
        st.lastT = t;
        try { bg.currentTime = t; } catch (e) { /* ignore */ }
      }
    }
  }, []);

  const onItemClick = useCallback((index) => setActive(index), []);

  const startScrub = useCallback((e) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    draggingRef.current = true;
    const move = (clientX) => {
      const rect = track.getBoundingClientRect();
      const tw = thumb.clientWidth;
      const max = rect.width - tw;
      const p = Math.min(Math.max((clientX - rect.left - tw / 2) / max, 0), 1);
      thumb.style.transform = `translateX(${(p * max).toFixed(2)}px)`;
      controlsRef.current?.scrollToProgress(p);
    };
    move(e.clientX);
    const onMove = (ev) => move(ev.clientX);
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  return (
    <section id="videos" className="relative w-full overflow-hidden bg-ink">
      {/* z0 — scroll-scrubbed backdrop (playhead driven by the gallery) */}
      <video
        ref={bgRef}
        src={bgNear ? BG_VIDEO : undefined}
        muted
        playsInline
        preload={bgNear ? 'auto' : 'none'}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* z5 — scrims: top blend into Artworks' ink, overall darken, bottom wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[40%] bg-gradient-to-b from-ink via-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[5] bg-ink/55" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[40%] bg-gradient-to-t from-ink to-transparent" />

      {/* z10 — content (section height = content, no dead gaps; bg video fills it) */}
      <div className="relative z-10">
        {/* indicator — identical to the Artworks chapter marker */}
        <div className="mx-auto w-full max-w-[1536px] px-5 pt-24 pb-2 sm:px-8 md:px-10 md:pt-28">
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
              VIDEOS
            </span>
          </motion.div>
        </div>

        {/* curved WebGL gallery — DEFINITE height so the WebGL canvas (height:100%)
            resolves and the cards render large. */}
        <div className="relative w-full" style={{ height: 'clamp(460px, 74vh, 840px)' }}>
          <CircularGallery
            items={items}
            bend={2.6}
            textColor="#ffffff"
            borderRadius={0.06}
            scrollEase={0.045}
            scrollSpeed={2.4}
            font="bold 26px Manrope"
            fontUrl="https://fonts.googleapis.com/css2?family=Manrope:wght@700&display=swap"
            onProgress={onProgress}
            onItemClick={onItemClick}
            controlsRef={controlsRef}
          />
        </div>

        {/* thin, clean glass scrollbar */}
        <div className="mx-auto mt-3 w-full max-w-[760px] px-6 pb-12 md:pb-16">
          <div
            ref={trackRef}
            onPointerDown={startScrub}
            className="group relative flex h-5 cursor-pointer touch-none items-center"
            role="scrollbar"
            aria-label="Scroll the video gallery"
            aria-orientation="horizontal"
          >
            <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/15" />
            <div
              ref={thumbRef}
              className="absolute h-[2px] w-12 rounded-full bg-white/70 transition-[height,background-color] duration-200 group-hover:h-[4px] group-hover:bg-white/90"
              style={{ top: '50%', marginTop: '-1px', left: 0, willChange: 'transform' }}
            />
          </div>
        </div>
      </div>

      {/* seam into the next chapter */}
      <GradualBlur position="bottom" height="5rem" strength={2} divCount={6} curve="ease-out" exponential zIndex={20} />

      {/* ── Lightbox (no autoplay) ── */}
      <AnimatePresence>
        {active != null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-md sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="glass relative max-h-[88vh] w-auto max-w-[92vw] overflow-hidden rounded-2xl"
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 10, opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close video"
                className="glass absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
              <video
                src={VIDEOS[active].src}
                poster={VIDEOS[active].poster}
                controls
                playsInline
                preload="metadata"
                className="block max-h-[88vh] max-w-[92vw] rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
