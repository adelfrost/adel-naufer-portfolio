import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1];

/* ── Animated speed line ── */
function SpeedLine({ active, top, width, delay }) {
  return (
    <motion.span
      className="pointer-events-none absolute h-[1.5px] rounded-full bg-cyan-200"
      style={{ top, width }}
      initial={{ x: 28, opacity: 0 }}
      animate={active ? { x: [24, -70], opacity: [0, 0.95, 0] } : { x: 28, opacity: 0 }}
      transition={active ? { duration: 0.46, repeat: Infinity, ease: 'linear', delay } : { duration: 0.2 }}
    />
  );
}

/**
 * JourneyButton — home "My Journey" CTA. Same comet-trail border as the Get in
 * Touch button. On hover the DeLorean revs inside the button while speed lines
 * streak past; on press it floors it out of the button, then opens the journey.
 */
export default function JourneyButton({ className = '' }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [launching, setLaunching] = useState(false);

  // comet-trail border (mirrors Hero's Get in Touch button)
  const outerRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const hoverRef = useRef(false);

  const start = useCallback(() => {
    hoverRef.current = true;
    const tick = () => {
      if (!hoverRef.current || !outerRef.current) return;
      angleRef.current = (angleRef.current + 1.6) % 360;
      const a = angleRef.current;
      outerRef.current.style.background =
        `conic-gradient(from ${a}deg, transparent 0%, rgba(245,158,11,0.85) 16%, rgba(255,248,220,1) 20%, rgba(245,158,11,0.85) 24%, transparent 44%, transparent 100%)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);
  const stop = useCallback(() => {
    hoverRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (outerRef.current) outerRef.current.style.background = 'rgba(255,255,255,0.14)';
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const launch = useCallback((e) => {
    e.preventDefault();
    if (launching) return;
    setLaunching(true);
    const go = () => { window.location.hash = '#journey'; };
    if (reduced) { go(); return; }
    setTimeout(go, 440);
  }, [launching, reduced]);

  const active = (hovered || launching) && !reduced;

  return (
    <motion.div
      ref={outerRef}
      className={`inline-block rounded-full ${className}`}
      style={{ background: 'rgba(255,255,255,0.14)', padding: '1px' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      whileHover={reduced ? undefined : { scale: 1.04 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      onMouseEnter={() => { setHovered(true); start(); }}
      onMouseLeave={() => { setHovered(false); stop(); }}
    >
      <a
        href="#journey"
        onClick={launch}
        aria-label="My Journey"
        className="relative flex h-[42px] w-[198px] items-center overflow-hidden rounded-full"
        style={{ background: 'rgba(10,6,3,0.92)' }}
      >
        {/* speed lines */}
        <div className="absolute inset-y-0 right-3 w-[128px]">
          <SpeedLine active={active} top="34%" width="44px" delay={0} />
          <SpeedLine active={active} top="50%" width="58px" delay={0.12} />
          <SpeedLine active={active} top="64%" width="36px" delay={0.06} />
          <SpeedLine active={active} top="44%" width="50px" delay={0.2} />
        </div>

        {/* label */}
        <span className="relative z-10 pl-5 text-sm font-medium text-white">My Journey</span>

        {/* car */}
        <div className="absolute inset-y-0 right-3 flex items-center">
          <motion.div
            animate={launching ? { x: 130, opacity: 0 } : hovered && !reduced ? { x: -5 } : { x: 0 }}
            transition={launching ? { duration: 0.5, ease: [0.5, 0, 0.3, 1] } : { type: 'spring', stiffness: 340, damping: 18 }}
          >
            <motion.img
              src="/img/delorean-button.png"
              alt=""
              draggable={false}
              className="h-[26px] w-auto select-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
              animate={active ? { y: [0, -1.6, 0] } : { y: 0 }}
              transition={active ? { duration: 0.32, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            />
          </motion.div>
        </div>
      </a>
    </motion.div>
  );
}
