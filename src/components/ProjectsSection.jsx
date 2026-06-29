import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import GlowingEffect from './GlowingEffect';
import GradualBlur from './GradualBlur';
import Lamp from './Lamp';
import { PROJECTS } from '../data/projectsData';

const EASE = [0.16, 1, 0.3, 1];
const STICKY_TOP = 118; // every card pins here — same top => clean, reversible stack

function initials(title) {
  return title
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function ProjectCard({ project, index, active, reduced, recedeRef }) {
  const tiltRef = useRef(null);
  const spotRef = useRef(null);
  const isActive = active && !reduced;

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
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

  const num = String(index + 1).padStart(2, '0');

  return (
    // recedeRef carries the scroll-driven transform (translateY/scale) + DOF blur
    // Spring cubic-bezier: slight overshoot on the way in, smooth ease on filter
    <div
      ref={recedeRef}
      className="h-full will-change-transform"
      style={{
        transformOrigin: 'top center',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.22, 0.64, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="h-full"
        style={{ perspective: '1400px' }}
        onMouseMove={isActive ? onMove : undefined}
        onMouseEnter={isActive ? onEnter : undefined}
        onMouseLeave={isActive ? onLeave : undefined}
      >
        <div
          ref={tiltRef}
          className="relative h-full rounded-[1.4rem] border border-white/10 p-2 transition-transform duration-200 ease-out md:rounded-[1.75rem] md:p-3"
          style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
        >
          {isActive && (
            <GlowingEffect spread={46} glow disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
          )}

          <div className="group/card relative grid h-full grid-cols-1 overflow-hidden rounded-[1.05rem] bg-[#0c0b0a] md:grid-cols-[1.25fr_1fr] md:rounded-[1.4rem]">
            <div
              ref={spotRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(300px circle at var(--x,50%) var(--y,50%), rgba(125,170,255,0.12), transparent 60%)',
              }}
            />

            {/* thumbnail */}
            <div className="relative min-h-[200px] overflow-hidden md:min-h-0">
              {project.thumb ? (
                <img
                  src={project.thumb}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover/card:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 30% 20%, hsl(${project.hue} 45% 20%), #0a0908 70%)` }}>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-[5rem] font-extrabold text-white/[0.06] md:text-[7rem]">
                    {initials(project.title)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent md:bg-gradient-to-r" />
              <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
                {project.tag}
              </span>
            </div>

            {/* info */}
            <div className="relative flex flex-col justify-between gap-6 p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-[0.2em] text-white/35">{num}</span>
                <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} />
                  {project.tag}
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="font-display text-2xl font-extrabold leading-[1.05] tracking-tight text-white md:text-3xl">
                  {project.title}
                </h3>
                {project.summary && (
                  <p className="max-w-sm font-body text-sm font-light leading-relaxed text-white/55">{project.summary}</p>
                )}
                <a
                  href={`#project/${project.slug}`}
                  className="group/btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  View project
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const deckRef = useRef(null);
  const wrapRefs = useRef([]);
  const recedeRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const raf = useRef(0);

  const recompute = useCallback(() => {
    const deck = deckRef.current;
    const first = wrapRefs.current[0];
    if (!deck || !first) return;

    // `progress` is a CONTINUOUS front-card index: it grows smoothly as you
    // scroll, so the recede/blur are scroll-linked (not stepped when the active
    // card flips). cardH = one card's flow height = the scroll to advance one.
    const cardH = first.offsetHeight || 1;
    const deckTop = deck.getBoundingClientRect().top;
    const progress = (STICKY_TOP - deckTop) / cardH;
    const active = Math.max(0, Math.min(PROJECTS.length - 1, Math.round(progress)));

    for (let i = 0; i < PROJECTS.length; i++) {
      const node = recedeRefs.current[i];
      if (!node) continue;
      const depth = progress - i; // >0 behind (receding), <0 ahead (incoming)
      if (depth >= 0) {
        const k = Math.min(depth, 5);
        const ty = -(k * 13);
        const sc = 1 - Math.min(k, 4) * 0.028;
        node.style.transform = `translateY(${ty.toFixed(2)}px) scale(${sc.toFixed(4)})`;
        node.style.filter = 'none';
      } else {
        node.style.transform = 'translateY(0) scale(1)';
        node.style.filter = 'none';
      }
    }
    setActiveIndex((prev) => (prev === active ? prev : active));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(recompute);
    };
    recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [recompute]);

  return (
    <section id="projects" ref={sectionRef} className="relative w-full bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-ink to-transparent" />

      {!reduced && <Lamp targetRef={sectionRef} />}

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pt-12 pb-12 sm:px-8 md:px-10 md:pt-14">
        <motion.div
          className="mb-8 flex items-center gap-4 sm:gap-5 md:mb-10"
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
            PROJECTS
          </span>
        </motion.div>

        {/* stacking deck — all cards pin at the same top; only the front is sharp + live */}
        <div ref={deckRef} className="relative">
          {PROJECTS.map((project, i) => (
            <div
              key={project.slug}
              ref={(el) => (wrapRefs.current[i] = el)}
              className="sticky"
              style={{ top: `${STICKY_TOP}px`, zIndex: i + 1, height: 'clamp(420px, 64vh, 540px)' }}
            >
              <ProjectCard
                project={project}
                index={i}
                active={i === activeIndex}
                reduced={reduced}
                recedeRef={(el) => (recedeRefs.current[i] = el)}
              />
            </div>
          ))}
        </div>
      </div>

      <GradualBlur position="bottom" height="5rem" strength={2} divCount={6} curve="ease-out" exponential zIndex={20} />
    </section>
  );
}
