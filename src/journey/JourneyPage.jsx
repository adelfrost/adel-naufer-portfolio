import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useReducedMotion } from 'motion/react';
import JourneyScene from './JourneyScene';
import TuningPanel from './TuningPanel';
import CameraRain from './CameraRain';
import { MotionBlur } from './effects';
import { useJourneyControls } from './useFlightControls';
import { CHAPTERS, MILESTONES, JOURNEY_LENGTH } from './journeyData';
import { PROJECT_TEXTS } from './journeyItems';
import tuningDefaults from './tuning.json';
import CardCanvasReveal from '../components/CardCanvasReveal';

const EASE = [0.16, 1, 0.3, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };
const CARD_PHOTO = '/img/adel-card.png';
const PILL_W = 62, PILL_H = 44, CARD_W = 250, CARD_H = 338;

// Derive current year from journey offset
const YEAR_MAP = MILESTONES.map((m) => ({
  at: m.at,
  year: (String(m.dates).match(/\d{4}/) || [''])[0],
}));
function yearFromOffset(offset) {
  let y = YEAR_MAP[0].year;
  for (const e of YEAR_MAP) { if (e.at <= offset + 8) y = e.year; }
  return y;
}

// Journey nav groups
const NAV_GROUPS = CHAPTERS.map((ch) => ({
  ...ch,
  items: MILESTONES.filter((m) => m.chapter === ch.key),
}));

// ── Keyboard key badge ─────────────────────────────────────────────────────
function Kbd({ children }) {
  return (
    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-white/25 bg-white/10 px-1.5 font-mono text-[10px] font-semibold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]">
      {children}
    </span>
  );
}

// ── AN button (top-right corner) — hover = profile card, click = exit ──────
function JourneyANButton({ onExit }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const mouseX = useMotionValue(CARD_W / 2);
  const mouseY = useMotionValue(CARD_H / 2);
  const spotlightMask = useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, white, transparent 80%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  return (
    <motion.div
      className="pointer-events-auto relative overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-xl"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 44px rgba(0,0,0,0.5)' }}
      initial={false}
      animate={{ width: open ? CARD_W : PILL_W, height: open ? CARD_H : PILL_H, borderRadius: open ? 26 : 22 }}
      transition={reduced ? { duration: 0 } : SPRING}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={onMove}
      onClick={onExit}
      role="button"
      aria-label="Back to main site"
      title="Click to return to main site"
    >
      {/* Collapsed: AN. pill */}
      <motion.div
        className="absolute inset-0 grid cursor-pointer select-none place-items-center"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        style={{ pointerEvents: 'none' }}
      >
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          AN<span className="text-white/40">.</span>
        </span>
      </motion.div>

      {/* Expanded: profile card */}
      <motion.div
        className="absolute left-0 top-0"
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: open ? 0.34 : 0.16, ease: EASE }}
        style={{ pointerEvents: open ? 'auto' : 'none', width: CARD_W, height: CARD_H }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-3/5 opacity-70 mix-blend-screen"
          style={{ background: 'linear-gradient(115deg, rgba(99,102,241,0.55), rgba(56,189,248,0.30) 34%, rgba(217,70,239,0.42) 66%, rgba(45,212,191,0.4))' }}
        />
        <img src={CARD_PHOTO} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover object-top" />
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ maskImage: spotlightMask, WebkitMaskImage: spotlightMask }}
        >
          <div className="absolute inset-0 bg-violet-500/10" />
          <CardCanvasReveal active={open && !reduced} className="absolute inset-0 h-full w-full" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-4 pt-14">
          <h3 className="font-display text-[19px] font-extrabold leading-none tracking-tight text-white">ADEL NAUFER</h3>
          <p className="mt-1.5 text-[11px] font-medium text-white/65">Sr Graphic Designer / Art Director</p>
          <div className="mt-3 flex gap-5">
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold leading-none text-white">13 Years +</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/45">Experience</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold leading-none text-white">GCC + EU</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/45">Experience</span>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
            Looking for a Senior role
          </p>
          <p className="mt-2.5 text-[10px] italic text-white/35">← click anywhere to return home</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Right-side glass journey log ───────────────────────────────────────────
function JourneyNav({ currentMsIdx }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="pointer-events-auto fixed right-0 top-1/2 z-[205] -translate-y-1/2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.div
        className="relative flex overflow-hidden rounded-l-2xl border border-r-0 border-white/10 bg-black/55 backdrop-blur-2xl"
        animate={{ width: open ? 272 : 28 }}
        transition={SPRING}
        style={{ maxHeight: '85vh' }}
      >
        {/* Collapsed tab */}
        <motion.div
          className="absolute right-0 top-0 flex h-full w-7 shrink-0 items-center justify-center"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.12 }}
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="select-none font-display text-[8px] font-bold uppercase tracking-[0.28em] text-white/40"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            log
          </span>
        </motion.div>

        {/* Expanded panel */}
        <motion.div
          className="w-[272px] shrink-0 overflow-y-auto py-5 pl-5 pr-4"
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.18, delay: open ? 0.08 : 0 }}
        >
          <p className="mb-4 font-display text-[10px] font-bold uppercase tracking-[0.32em] text-white/50">
            Journey Log
          </p>

          {NAV_GROUPS.map((group) => (
            <div key={group.key} className="mb-5">
              <p className="mb-2 font-display text-[9px] font-semibold uppercase tracking-[0.22em]" style={{ color: group.color }}>
                {group.title}
              </p>
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className={`mb-2 border-l py-0.5 pl-3 transition-colors ${currentMsIdx === MILESTONES.indexOf(item) ? 'border-white/60' : 'border-white/12'}`}
                >
                  <p className="font-sans text-[11.5px] font-medium leading-snug text-white/80">{item.title}</p>
                  <p className="mt-0.5 font-sans text-[9.5px] text-white/38">{item.org} · {item.dates}</p>
                </div>
              ))}
            </div>
          ))}

          <div className="mb-2 mt-2 border-t border-white/8 pt-4">
            <p className="mb-2 font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-300/60">
              Projects &amp; Works
            </p>
            {PROJECT_TEXTS.map((p, i) => {
              const isNovel = p.text === 'SHATTERLANDS';
              return (
                <div key={i} className={`mb-2 border-l py-0.5 pl-3 ${isNovel ? 'border-violet-400/50' : 'border-white/12'}`}>
                  <p className={`font-sans text-[11.5px] font-medium leading-snug ${isNovel ? 'text-violet-200' : 'text-white/70'}`}>
                    {p.text}
                    {isNovel && <span className="ml-1.5 rounded bg-violet-500/20 px-1 py-px text-[8px] uppercase tracking-wider text-violet-300">Novel</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function JourneyPage({ onExit }) {
  // Asset-loading gate: use drei's global progress store
  const { active: loadActive } = useProgress();
  const everActive = useRef(false);
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    if (loadActive) { everActive.current = true; return undefined; }
    // If we've seen loading start+finish: short grace period.
    // If loading never started (all cached): longer wait.
    const delay = everActive.current ? 450 : 1600;
    const t = setTimeout(() => setAssetsReady(true), delay);
    return () => clearTimeout(t);
  }, [loadActive]);

  const [ms, setMs] = useState(null);
  const [started, setStarted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const tuning = useRef(JSON.parse(JSON.stringify(tuningDefaults)));
  const blurRef = useRef(0);
  const startedRef = useRef(false);
  const progressRef = useRef(0);
  const offsetRef = useRef(0);

  const controls = useJourneyControls(() => setShowHint(false));

  const onProgress = useCallback((p, rawOffset) => {
    progressRef.current = p;
    offsetRef.current = rawOffset != null ? rawOffset : p * JOURNEY_LENGTH;
  }, []);

  const onMilestone = useCallback((m, idx) => setMs(m ? { ...m, idx } : null), []);

  const begin = useCallback(() => { startedRef.current = true; setStarted(true); }, []);

  useEffect(() => {
    if (started || !assetsReady) return undefined;
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'Enter') begin(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, assetsReady, begin]);

  const chapter = ms ? CHAPTERS.find((c) => c.key === ms.chapter) : null;

  // Drive timeline DOM via rAF — no per-frame setState
  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progressRef.current;
      const off = offsetRef.current;
      const pct = `${(p * 100).toFixed(2)}%`;
      const fill = document.getElementById('tl-fill');
      const dot = document.getElementById('tl-dot');
      const year = document.getElementById('tl-year');
      if (fill) fill.style.width = pct;
      if (dot) dot.style.left = pct;
      if (year) year.textContent = yearFromOffset(off);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Force R3F canvas to correct size after mount
  useEffect(() => {
    const ids = [0, 80, 250, 600].map((t) => setTimeout(() => window.dispatchEvent(new Event('resize')), t));
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] select-none overflow-hidden bg-[#0a0a1f]">
      <Canvas
        camera={{ position: [0, 9, 25], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.toneMappingExposure = 1.05; }}
      >
        <JourneyScene
          controls={controls}
          tuning={tuning}
          blurRef={blurRef}
          startedRef={startedRef}
          onProgress={onProgress}
          onMilestone={onMilestone}
        />
        <EffectComposer disableNormalPass>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.3} />
          <Vignette eskil={false} offset={0.18} darkness={0.72} />
          <MotionBlur blurRef={blurRef} />
        </EffectComposer>
      </Canvas>

      <CameraRain tuning={tuning} />
      {/* Tuning panel — hidden from site, available when needed */}
      {false && <TuningPanel tuning={tuning} />}

      {/* ── HUD top bar ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.34em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          My Journey
        </span>
        <span className="rounded-full bg-black/25 px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200/85 backdrop-blur-sm">
          Work in Progress
        </span>
        <JourneyANButton onExit={onExit} />
      </div>

      {/* ── Right-side journey log ── */}
      <JourneyNav currentMsIdx={ms ? ms.idx : -1} />

      {/* ── Milestone card ── */}
      <div className="pointer-events-none absolute bottom-20 left-0 w-full px-6 sm:bottom-24 sm:px-10">
        <AnimatePresence mode="wait">
          {ms && (
            <motion.div
              key={ms.idx}
              className="max-w-md drop-shadow-[0_2px_14px_rgba(60,30,5,0.55)]"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="block h-px w-8 bg-white/70" />
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-white">
                  {chapter ? chapter.title : ''}
                </span>
              </div>
              <p className="font-sans text-xs font-light uppercase tracking-[0.2em] text-white/70">{ms.dates}</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight text-white sm:text-[32px]">{ms.title}</h3>
              <p className="mt-1 font-sans text-sm text-white/85">{ms.org}</p>
              <p className="mt-3 font-display text-lg font-bold tracking-tight text-[#ffe9b8]">{ms.stat}</p>
              <p className="mt-1.5 max-w-md font-sans text-[13px] font-light leading-relaxed text-white/75">{ms.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Year timeline (rAF-driven) ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/45">2000</span>
            <span id="tl-year" className="font-display text-xl font-extrabold tabular-nums text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]" />
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/45">2026</span>
          </div>
          <div className="relative h-[3px] w-full rounded-full bg-white/20">
            <div id="tl-fill" className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: '0%', boxShadow: '0 0 12px 2px rgba(255,255,255,0.55)' }} />
            {YEAR_MAP.map((y, i) => (
              <span key={i} title={y.year} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/50" style={{ left: `${((y.at / JOURNEY_LENGTH) * 100).toFixed(1)}%` }} />
            ))}
            <span id="tl-dot" className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: '0%', boxShadow: '0 0 10px 2px rgba(255,255,255,0.7)' }} />
          </div>
        </div>
      </div>

      {/* In-game hint */}
      <AnimatePresence>
        {started && showHint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-32 flex items-center justify-center sm:bottom-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-full bg-black/30 px-5 py-2.5 backdrop-blur-md">
              <span className="font-sans text-xs font-light tracking-wide text-white/75 sm:text-sm">
                W / ↑ forward · S / ↓ back · Space to rise
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start screen (only revealed once assets are ready) ── */}
      <AnimatePresence>
        {!started && assetsReady && (
          <motion.div
            onClick={begin}
            className="absolute inset-0 z-[206] flex cursor-pointer flex-col items-center justify-center bg-[#0a0a1f]/65 px-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.42em] text-white/50">
              Adel Naufer
            </span>

            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              MY JOURNEY
            </h1>

            <p className="mt-4 max-w-sm font-sans text-sm font-light leading-relaxed text-white/55 sm:text-base">
              Travel through time and discover my story, one milestone at a time.
            </p>

            {/* BTTF playful callout */}
            <div className="mt-5 max-w-xs rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
              <p className="font-sans text-[12px] leading-relaxed text-white/70">
                <span className="mr-1.5 text-amber-300">⚡</span>
                Yes, that's the actual <span className="font-semibold text-white">Back to the Future</span> DeLorean.
                You can fly forward through my career — or gun it in reverse.
                Time is yours.
              </p>
            </div>

            {/* Keyboard guide */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-1.5 text-white/60">
                <Kbd>W</Kbd><span className="text-white/25 text-xs">/</span><Kbd>↑</Kbd>
                <span className="ml-1 text-xs">Forward</span>
              </div>
              <span className="text-white/20 text-xs">·</span>
              <div className="flex items-center gap-1.5 text-white/60">
                <Kbd>S</Kbd><span className="text-white/25 text-xs">/</span><Kbd>↓</Kbd>
                <span className="ml-1 text-xs">Back</span>
              </div>
              <span className="text-white/20 text-xs">·</span>
              <div className="flex items-center gap-1.5 text-white/60">
                <Kbd>Space</Kbd>
                <span className="ml-1 text-xs">Rise</span>
              </div>
            </div>

            <motion.button
              onClick={(e) => { e.stopPropagation(); begin(); }}
              className="pointer-events-auto mt-8 rounded-full bg-white px-9 py-3 font-display text-sm font-bold uppercase tracking-[0.22em] text-[#0a0a1f]"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              Begin
            </motion.button>

            <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.22em] text-white/30">
              or press Space
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Loader
        containerStyles={{ background: '#0a0a1f', zIndex: 207 }}
        innerStyles={{ background: 'rgba(255,255,255,0.14)' }}
        barStyles={{ background: '#ff3d7f' }}
        dataStyles={{ color: '#cbb3e6', fontFamily: 'Manrope, sans-serif', fontSize: '13px' }}
      />
    </div>
  );
}
