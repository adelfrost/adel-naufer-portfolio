import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Fingerprint, Users, Share2, BarChart3, Camera, Box } from 'lucide-react';
import GlowingEffect from './GlowingEffect';
import { CORE } from '../data/core';

const EASE = [0.16, 1, 0.3, 1];
const LUCIDE = { Fingerprint, Users, Share2, BarChart3, Camera };

function CardIcon({ card }) {
  // Adobe tool icons (colourful)
  if (card.tools) {
    return (
      <div className="flex items-center gap-2">
        {card.tools.map((t) => (
          <img key={t} src={`/figma/${t}.png`} alt="" draggable={false} className="h-8 w-8 select-none" />
        ))}
      </div>
    );
  }
  // brand marks as uniform chips (logo where available + name)
  if (card.marks) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {card.marks.map((m) => (
          <span
            key={m.name}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/75"
          >
            {m.logo && (
              <img src={`/logos/${m.logo}.svg`} alt="" draggable={false} className="h-3 w-3 select-none opacity-90" />
            )}
            {m.name}
          </span>
        ))}
      </div>
    );
  }
  const Ic = LUCIDE[card.icon] || Box;
  return (
    <div className="w-fit rounded-lg border border-white/15 bg-white/[0.03] p-2">
      <Ic className="h-4 w-4 text-white/85" strokeWidth={1.75} />
    </div>
  );
}

function CoreCard({ card, index, reduced }) {
  const tiltRef = useRef(null);
  const spotRef = useRef(null);

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
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

  return (
    <motion.li
      className={`min-h-[13rem] list-none ${card.span}`}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.04, 0.3) }}
    >
      {/* perspective wrapper */}
      <div
        className="h-full"
        style={{ perspective: '1100px' }}
        onMouseMove={reduced ? undefined : onMove}
        onMouseEnter={reduced ? undefined : onEnter}
        onMouseLeave={reduced ? undefined : onLeave}
      >
        {/* tilt card (preserve-3d so the inner content can float on translateZ) */}
        <div
          ref={tiltRef}
          className="relative h-full rounded-2xl border border-white/10 p-2 transition-transform duration-200 ease-out [transform-style:preserve-3d] md:rounded-3xl md:p-3"
          style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
        >
          <GlowingEffect spread={42} glow disabled={false} proximity={72} inactiveZone={0.01} borderWidth={2} />

          <div className="relative flex h-full flex-col rounded-xl bg-white/[0.02] p-5 [transform-style:preserve-3d] md:p-6">
            {/* cursor spotlight (clips itself to the rounded card) */}
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
              <div style={{ transform: 'translateZ(22px)' }}>
                <CardIcon card={card} />
              </div>
              <div className="space-y-2" style={{ transform: 'translateZ(12px)' }}>
                <h3 className="font-display text-lg font-semibold tracking-tight text-white md:text-xl">
                  {card.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-white/55">{card.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default function CoreSection() {
  const reduced = useReducedMotion();

  return (
    <section id="core" className="relative w-full overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-5 pt-24 pb-10 sm:px-8 md:px-10 md:pt-28 md:pb-12">
        {/* indicator — matches Artworks / Videos */}
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
            CORE
          </span>
        </motion.div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          {CORE.map((card, i) => (
            <CoreCard key={card.title} card={card} index={i} reduced={reduced} />
          ))}
        </ul>
      </div>
    </section>
  );
}
