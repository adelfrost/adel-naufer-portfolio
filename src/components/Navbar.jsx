import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { NAV_LINKS } from '../data/content';
import GlassSurface from './GlassSurface';
import JourneyButton from './JourneyButton';

const ease = [0.16, 1, 0.3, 1];
const PILL_H = 44;

// The compact badge reflects the section you're in. About keeps the signature
// "ADEL NAUFER"; every later section shows its own name. DOM order matters —
// the scroll-spy walks these and picks whichever fills the most of the viewport.
const SECTION_LABELS = [
  ['about', 'ADEL NAUFER'],
  ['artworks', 'ARTWORKS'],
  ['projects', 'PROJECTS'],
  ['videos', 'VIDEOS'],
  ['core', 'CORE'],
  ['languages', 'LANGUAGES'],
  ['contact', 'CALL ME?'],
];
const DEFAULT_LABEL = 'ADEL NAUFER';

// Shared liquid-glass tuning for every pill in the bar.
const GLASS = {
  borderRadius: PILL_H / 2,
  blur: 10,
  displace: 1,
  distortionScale: -140,
  greenOffset: 12,
  blueOffset: 22,
  brightness: 62,
  opacity: 0.9,
  backgroundOpacity: 0.06,
  saturation: 1.5,
};

/* ── Single nav link ── */
function NavLink({ link, onClick }) {
  return (
    <motion.a
      href={link.href}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
      transition={{ duration: 0.12 }}
      className="rounded-full px-4 py-2 text-sm font-medium text-white/85 hover:text-white"
    >
      {link.label}
    </motion.a>
  );
}

/* ─────────────────────────────────────────────
   MorphPill — ONE element that liquid-morphs between the full nav and the
   compact "ADEL NAUFER" badge. The width animates (spring) between the two
   measured content widths while the contents cross-fade; the GlassSurface skin
   stretches with it. Not two pills swapping — a single continuous morph.
───────────────────────────────────────────── */
// Smooth Apple-style ease for the width morph (CSS transition — reliable, no
// per-property framer width quirks; the glass skin stretches with it).
const MORPH_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const BADGE_CLS =
  'whitespace-nowrap px-7 font-display text-sm font-bold tracking-[0.14em] text-white';

function MorphPill({ collapsed, label, onLinkClick, onHover }) {
  const fullRef = useRef(null);
  const measureRef = useRef(null); // hidden span sized to the CURRENT label
  const [w, setW] = useState({ full: 444, compact: 208 });

  // Re-measure when the label changes so the pill morphs to fit each word
  // ("CORE" is narrower than "ADEL NAUFER", "LANGUAGES" wider).
  useLayoutEffect(() => {
    const measure = () => {
      const f = fullRef.current?.offsetWidth;
      const c = measureRef.current?.offsetWidth;
      setW((prev) => ({
        full: f ? Math.ceil(f) + 16 : prev.full,
        compact: c ? Math.ceil(c) + 16 : prev.compact,
      }));
    };
    measure();
    document.fonts?.ready?.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [label]);

  return (
    <motion.div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="relative"
      animate={{ width: collapsed ? w.compact : w.full }}
      transition={{ type: 'spring', stiffness: 300, damping: 36, mass: 0.72 }}
      style={{ height: PILL_H }}
    >
      {/* off-screen measurer — same type metrics as the visible badge */}
      <span ref={measureRef} aria-hidden="true" className={`invisible absolute -z-10 ${BADGE_CLS}`}>
        {label}
      </span>

      <GlassSurface {...GLASS} width="100%" height="100%">
        <div className="relative h-full w-full">
          {/* full nav row */}
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, filter: collapsed ? 'blur(4px)' : 'blur(0px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: collapsed ? 'none' : 'auto' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div ref={fullRef} className="flex items-center whitespace-nowrap px-2">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.label} link={l} onClick={onLinkClick} />
              ))}
            </div>
          </motion.div>

          {/* compact badge — label crossfades as you cross sections.
              grid place-items-center stacks old/new in one cell so they overlap
              (clean crossfade) without pushing each other sideways. */}
          <motion.div
            animate={{ opacity: collapsed ? 1 : 0, filter: collapsed ? 'blur(0px)' : 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: 'none' }}
            className="absolute inset-0 grid place-items-center"
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`col-start-1 row-start-1 ${BADGE_CLS}`}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>
      </GlassSurface>
    </motion.div>
  );
}

/* fade for logo / My Journey */
const fadeScale = {
  hidden: { opacity: 0, scale: 0.94, y: -3 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: -3 },
};
const fadeScaleT = { duration: 0.22, ease };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState(DEFAULT_LABEL);

  /* Collapse navbar when hero leaves viewport */
  useEffect(() => {
    const hero = document.querySelector('#home');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([e]) => { setScrolled(!e.isIntersecting); setExpanded(false); },
      { threshold: 0.12 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  /* Scroll-spy: the compact badge shows whichever section fills most of the view */
  useEffect(() => {
    const entries = SECTION_LABELS
      .map(([id, text]) => {
        const el = document.getElementById(id);
        return el ? { el, text } : null;
      })
      .filter(Boolean);
    if (!entries.length) return undefined;

    let raf = 0;
    const pick = () => {
      const vh = window.innerHeight;
      let bestText = DEFAULT_LABEL;
      let bestVisible = 0;
      for (const { el, text } of entries) {
        const r = el.getBoundingClientRect();
        const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        if (visible > bestVisible) {
          bestVisible = visible;
          bestText = text;
        }
      }
      setLabel((prev) => (prev === bestText ? prev : bestText));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const collapsed = scrolled && !expanded;

  return (
    <>
      {/* z-50 keeps the bar painted ABOVE any section's backdrop-filter seam. */}
      <nav className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5">
        <div className="relative flex items-center justify-center" style={{ minHeight: PILL_H }}>

          {/* Top-left AN. mark lives in <ProfileLogo /> (fixed, persistent) so it
              stays through the whole site and can morph into the profile card. */}

          {/* ── Centre: the single morphing glass pill ── */}
          <div className="hidden md:block">
            <MorphPill
              collapsed={collapsed}
              label={label}
              onLinkClick={() => setExpanded(false)}
              onHover={(h) => scrolled && setExpanded(h)}
            />
          </div>

          {/* ── My Journey (absolute right, hidden when scrolled) ── */}
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                key="journey"
                initial="hidden" animate="visible" exit="exit"
                variants={fadeScale} transition={fadeScaleT}
                className="absolute right-0 hidden md:block"
              >
                <JourneyButton />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mobile hamburger ── */}
          <div className="absolute right-0 md:hidden">
            <GlassSurface {...GLASS} width={PILL_H} height={PILL_H}>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="flex h-full w-full items-center justify-center text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            </GlassSurface>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-md md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-display text-lg font-extrabold tracking-tight text-white">AN.</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="glass inline-flex h-11 w-11 items-center justify-center rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col justify-center gap-2 px-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-4xl font-extrabold tracking-tight text-white"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * NAV_LINKS.length + 0.1 }}
                className="mt-6"
              >
                <a
                  href="#journey"
                  onClick={() => setOpen(false)}
                  className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  My Journey
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
