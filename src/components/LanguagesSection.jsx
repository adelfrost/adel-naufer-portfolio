import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';
import GlowingEffect from './GlowingEffect';
import GradualBlur from './GradualBlur';
import { CardPattern, generateRandomString } from './EvervaultCard';
import { LANGUAGES } from '../data/languages';

const EASE = [0.16, 1, 0.3, 1];

function LangCard({ lang, index, reduced }) {
  const tiltRef = useRef(null);
  const spotRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [rand, setRand] = useState('');

  useEffect(() => {
    setRand(generateRandomString(1100));
  }, []);

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
    setRand(generateRandomString(1100));
    const spot = spotRef.current;
    if (spot) {
      spot.style.setProperty('--x', `${(px * 100).toFixed(1)}%`);
      spot.style.setProperty('--y', `${(py * 100).toFixed(1)}%`);
    }
  };
  const onEnter = () => spotRef.current && (spotRef.current.style.opacity = '1');
  const onLeave = () => {
    const el = tiltRef.current;
    if (el) {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
    if (spotRef.current) spotRef.current.style.opacity = '0';
  };

  const nameSize = lang.compact
    ? 'text-[clamp(26px,3vw,38px)]'
    : 'text-[clamp(34px,4.4vw,62px)]';

  return (
    <motion.li
      className={`min-h-[12.5rem] list-none ${lang.span}`}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.05, 0.35) }}
    >
      {/* perspective wrapper */}
      <div
        className="h-full"
        style={{ perspective: '1100px' }}
        onMouseMove={reduced ? undefined : onMove}
        onMouseEnter={reduced ? undefined : onEnter}
        onMouseLeave={reduced ? undefined : onLeave}
      >
        {/* tilt card */}
        <div
          ref={tiltRef}
          className="relative h-full rounded-2xl border border-white/10 p-2 transition-transform duration-200 ease-out [transform-style:preserve-3d] md:rounded-3xl md:p-3"
          style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
        >
          <GlowingEffect spread={42} glow disabled={false} proximity={72} inactiveZone={0.01} borderWidth={2} />

          <div className="group/card relative flex h-full flex-col overflow-hidden rounded-xl bg-white/[0.02] p-5 [transform-style:preserve-3d] md:p-6">
            {!reduced && <CardPattern mouseX={mouseX} mouseY={mouseY} randomString={rand} />}

            {/* cursor spotlight */}
            <div
              ref={spotRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(240px circle at var(--x,50%) var(--y,50%), rgba(125,170,255,0.14), transparent 62%)',
              }}
            />

            {/* floating content */}
            <div
              className="relative flex flex-1 flex-col justify-between gap-5"
              style={{ transform: 'translateZ(34px)', transformStyle: 'preserve-3d' }}
            >
              {/* code badge */}
              <span
                className="self-end font-mono text-[11px] tracking-wider text-white/45"
                style={{ transform: 'translateZ(12px)' }}
              >
                {lang.code}
              </span>

              {/* native name + proficiency */}
              <div className="flex flex-col gap-3" style={{ transform: 'translateZ(22px)' }}>
                <h3
                  dir={lang.rtl ? 'rtl' : 'ltr'}
                  className={`font-display font-extrabold uppercase leading-[0.9] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] ${nameSize}`}
                >
                  {lang.name}
                </h3>

                <div className="flex flex-col gap-1">
                  {lang.rows.map(([k, v]) => (
                    <p key={k} className="font-body text-[13px] leading-snug text-white/75 sm:text-sm">
                      <span className="text-white/45">{k}</span>
                      <span className="px-1 text-white/20">/</span>
                      <span className="font-medium text-white/90">{v}</span>
                    </p>
                  ))}
                  {lang.note && (
                    <p className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-emerald-300/70">
                      {lang.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default function LanguagesSection() {
  const reduced = useReducedMotion();

  return (
    <section id="languages" className="relative w-full overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-5 pt-10 pb-24 sm:px-8 md:px-10 md:pt-12 md:pb-28">
        <motion.div
          className="mb-10 flex items-center gap-4 sm:gap-5 md:mb-12"
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
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.34em] text-white sm:text-xs">
            LANGUAGES
          </span>
        </motion.div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          {LANGUAGES.map((lang, i) => (
            <LangCard key={lang.name} lang={lang} index={i} reduced={reduced} />
          ))}
        </ul>
      </div>

      <GradualBlur position="bottom" height="5rem" strength={2} divCount={6} curve="ease-out" exponential zIndex={20} />
    </section>
  );
}
