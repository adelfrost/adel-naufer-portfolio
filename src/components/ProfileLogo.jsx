import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from 'motion/react';
import CardCanvasReveal from './CardCanvasReveal';

const CARD_PHOTO = '/img/adel-card.png';

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };

// collapsed AN pill / expanded card dimensions
const PILL_W = 62;
const PILL_H = 44;
const CARD_W = 250;
const CARD_H = 338;

/**
 * ProfileLogo — the persistent top-left "AN." mark. It's `fixed`, so it stays
 * pinned through the whole page, and on hover it spring-morphs down-and-right
 * into a profile card (nav-glass style) with a cursor spotlight revealing a
 * blue→violet dot-matrix.
 */
export default function ProfileLogo() {
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
      className="group fixed left-4 top-4 z-50 hidden overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-xl md:block lg:left-8 lg:top-5"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 44px rgba(0,0,0,0.5)' }}
      initial={false}
      animate={{
        width: open ? CARD_W : PILL_W,
        height: open ? CARD_H : PILL_H,
        borderRadius: open ? 26 : 22,
      }}
      transition={reduced ? { duration: 0 } : SPRING}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={onMove}
      onClick={() => setOpen((v) => !v)}
      role="button"
      aria-label="Adel Naufer — Senior Graphic Designer and Art Director"
      aria-expanded={open}
    >
      {/* ── Collapsed: AN. monogram ── */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        style={{ pointerEvents: 'none' }}
      >
        <span className="font-display text-lg font-extrabold tracking-tight text-white">
          AN<span className="text-white/40">.</span>
        </span>
      </motion.div>

      {/* ── Expanded: profile card ── */}
      <motion.div
        className="absolute left-0 top-0"
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: open ? 0.34 : 0.16, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: open ? 'auto' : 'none', width: CARD_W, height: CARD_H }}
      >
        {/* holographic header sheen (sits behind the cut-out) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-3/5 opacity-70 mix-blend-screen"
          style={{
            background:
              'linear-gradient(115deg, rgba(99,102,241,0.55), rgba(56,189,248,0.30) 34%, rgba(217,70,239,0.42) 66%, rgba(45,212,191,0.4))',
          }}
        />

        {/* photo (transparent cut-out) */}
        <img
          src={CARD_PHOTO}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover object-top"
        />

        {/* reveal: dot-matrix shown only through the cursor spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ maskImage: spotlightMask, WebkitMaskImage: spotlightMask }}
        >
          <div className="absolute inset-0 bg-violet-500/10" />
          <CardCanvasReveal active={open && !reduced} className="absolute inset-0 h-full w-full" />
        </motion.div>

        {/* bottom scrim + copy */}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-4 pt-14">
          <h3 className="font-display text-[19px] font-extrabold leading-none tracking-tight text-white">
            ADEL NAUFER
          </h3>
          <p className="mt-1.5 text-[11px] font-medium text-white/65">
            Sr Graphic Designer / Art Director
          </p>

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
        </div>
      </motion.div>
    </motion.div>
  );
}
