import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import Navbar from './Navbar';
import TextPressure from './TextPressure';
import { HERO, STATS, HERO_VIDEO } from '../data/content';

const ease = [0.16, 1, 0.3, 1];

/* ── Hover-border-gradient CTA ──
   A comet-trail light orbits the pill border on hover.
   Uses conic-gradient + RAF for smooth rotation without
   CSS transition limitations on gradient strings. */
function HoverBorderGradient({ children, href, delay = 0, className = '' }) {
  const outerRef   = useRef(null);
  const angleRef   = useRef(0);
  const rafRef     = useRef(null);
  const hoveredRef = useRef(false);

  const start = useCallback(() => {
    hoveredRef.current = true;
    const tick = () => {
      if (!hoveredRef.current || !outerRef.current) return;
      angleRef.current = (angleRef.current + 1.6) % 360;
      const a = angleRef.current;
      outerRef.current.style.background =
        `conic-gradient(from ${a}deg, transparent 0%, rgba(245,158,11,0.85) 16%, rgba(255,248,220,1) 20%, rgba(245,158,11,0.85) 24%, transparent 44%, transparent 100%)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    hoveredRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (outerRef.current) outerRef.current.style.background = 'rgba(255,255,255,0.14)';
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <motion.div
      ref={outerRef}
      className={`rounded-full ${className}`}
      style={{ background: 'rgba(255,255,255,0.14)', padding: '1px' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      <a
        href={href}
        className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
        style={{ background: 'rgba(10,6,3,0.92)' }}
      >
        {children}
      </a>
    </motion.div>
  );
}

/* ── Count-up number ── */
function CountUp({ to, prefix = '', suffix = '', duration = 1.6, className, style }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          const start = performance.now();
          const tick = (now) => {
            const raw = Math.min((now - start) / (duration * 1000), 1);
            setValue(Math.round(to * (1 - Math.pow(1 - raw, 3))));
            if (raw < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{value}{suffix}
    </span>
  );
}

/* ── Smoke greeting: per-char blur-in on mount, smoke dissipate on hover ── */
function SmokeText({ text, className }) {
  const [hovered, setHovered] = useState(false);
  const chars = text.split('');

  // Stable per-char random drift — computed once on mount
  const drifts = useRef(
    chars.map(() => ({
      y:    -(10 + Math.random() * 24),
      x:    (Math.random() - 0.5) * 20,
      blur: 8  + Math.random() * 14,
      dur:  0.25 + Math.random() * 0.3,
    }))
  );

  return (
    <p
      aria-label={text}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default', userSelect: 'none' }}
    >
      {chars.map((ch, i) => {
        const d = drifts.current[i];
        return (
          <motion.span
            key={i}
            aria-hidden
            style={{ display: 'inline-block' }}
            /* Entry: each char fades from 50% opacity + 5px blur → sharp */
            initial={{ opacity: 0.5, filter: 'blur(5px)', y: 0, x: 0 }}
            animate={
              hovered
                ? { opacity: 0, filter: `blur(${d.blur}px)`, y: d.y, x: d.x }
                : { opacity: 1, filter: 'blur(0px)', y: 0, x: 0 }
            }
            transition={
              hovered
                ? { duration: d.dur, delay: i * 0.022, ease: [0.4, 0, 1, 1] }
                : { duration: 0.55, delay: i * 0.02, ease }
            }
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        );
      })}
    </p>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[100svh] w-full overflow-hidden bg-ink">
      {/* Background video */}
      <video
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: 'center 35%' }}
        src={HERO_VIDEO}
      />

      {/* Scrim gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" />

      <Navbar />

      {/* ── Main layout: full viewport height, flex column ── */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1536px] flex-col px-5 sm:px-8 md:px-10">

        {/* ── CENTER: Greeting — fills the middle, centered ── */}
        <div className="flex flex-1 items-center justify-center pt-20 md:pt-24">
          <SmokeText
            text="Glad you stopped in. Good taste tends to find me."
            className="text-center font-body font-light italic leading-relaxed text-white/85 text-xl sm:text-2xl md:text-3xl lg:text-[2.4rem]"
          />
        </div>

        {/* ── BOTTOM: Name + stats (left) | Get in Touch (right) ── */}
        <div className="flex flex-col gap-7 pb-10 md:flex-row md:items-end md:justify-between md:pb-12">

          {/* Left: name block + stats row */}
          <div>
            {/* Variable-font name with TextPressure */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease, delay: 0.28 }}
              className="drop-shadow-[0_4px_32px_rgba(0,0,0,0.55)]"
            >
              <TextPressure
                text={HERO.firstName}
                fontSize="clamp(42px, 7.2vw, 94px)"
                maxDistance={280}
                minWeight={200} maxWeight={900}
                minWidth={60}   maxWidth={145}
                minSlant={0}    maxSlant={-8}
                style={{ letterSpacing: '-0.025em', color: '#fff', display: 'block' }}
              />
              <TextPressure
                text={HERO.lastName}
                fontSize="clamp(38px, 6.6vw, 86px)"
                maxDistance={280}
                minWeight={200} maxWeight={900}
                minWidth={60}   maxWidth={145}
                minSlant={0}    maxSlant={-8}
                style={{ letterSpacing: '-0.015em', color: '#fff', display: 'block' }}
              />
            </motion.div>

            {/* Stats — 2×2 on mobile, 4-col row on sm+ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.44 }}
              className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 sm:gap-x-10"
            >
              {STATS.map((s) => (
                <div key={s.num} className="flex flex-col">
                  {s.countTo != null ? (
                    <CountUp
                      to={s.countTo}
                      prefix={s.prefix || ''}
                      suffix={s.suffix || ''}
                      duration={1.6}
                      className="font-display font-extrabold leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                      style={{ fontSize: 'clamp(22px, 2.8vw, 44px)' }}
                    />
                  ) : (
                    <span
                      className="font-display font-extrabold leading-none text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                      style={{ fontSize: 'clamp(22px, 2.8vw, 44px)' }}
                    >
                      {s.num}
                    </span>
                  )}
                  <span className="mt-1.5 whitespace-pre-line text-[9px] font-light uppercase leading-snug tracking-[0.18em] text-white/55 sm:text-[10px]">
                    {s.sub}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: CTA — hover-border-gradient pill */}
          <HoverBorderGradient
            href="#contact"
            delay={0.52}
            className="self-start md:self-auto"
          >
            {HERO.cta}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </HoverBorderGradient>
        </div>
      </div>
    </section>
  );
}
