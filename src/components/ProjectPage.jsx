import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X, Home, Maximize2 } from 'lucide-react';
import { PROJECT_BY_SLUG } from '../data/projectsData';

const EASE = [0.16, 1, 0.3, 1];

const goHome = () => { window.location.hash = ''; };
const goWork = () => { window.location.hash = '#projects'; };
const goProject = (slug) => { window.location.hash = `#project/${slug}`; };

/* ── In-view autoplay video (plays only when visible, saves bandwidth) ── */
function SmartVideo({ src, className, portrait }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      controls
      style={portrait ? { aspectRatio: '9 / 16' } : undefined}
    />
  );
}

/* ── Lightbox ── */
function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);

  return (
    <motion.div
      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/92 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
      {items.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Previous" className="absolute left-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Next" className="absolute right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}
      <AnimatePresence mode="wait">
        <motion.img
          key={items[index]}
          src={items[index]}
          alt=""
          className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.25, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      {items.length > 1 && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-sans text-xs tracking-widest text-white/55">
          {index + 1} / {items.length}
        </span>
      )}
    </motion.div>
  );
}

/* ── Reveal wrapper ── */
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Individual blocks ── */
function Block({ block, accent, openLightbox }) {
  const t = block.type;

  if (t === 'section') {
    return (
      <Reveal className="mx-auto max-w-3xl px-6">
        {block.heading && (
          <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[34px]">
            {block.heading}
          </h2>
        )}
        {block.body && (
          <p className="mt-5 font-body text-[15px] font-light leading-relaxed text-white/70 sm:text-lg">
            {block.body}
          </p>
        )}
      </Reveal>
    );
  }

  if (t === 'statement') {
    return (
      <Reveal className="mx-auto max-w-4xl px-6 text-center">
        <p className="font-display text-2xl font-extrabold leading-[1.25] tracking-tight text-white sm:text-4xl">
          <span style={{ color: accent }}>“</span>
          {block.text}
          <span style={{ color: accent }}>”</span>
        </p>
      </Reveal>
    );
  }

  if (t === 'stats') {
    return (
      <Reveal className="mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {(block.stats || []).map((s, i) => (
            <div key={i} className="border-l border-white/12 pl-4">
              <div className="font-display text-2xl font-extrabold text-white sm:text-3xl" style={{ color: accent }}>{s.value}</div>
              <div className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    );
  }

  if (t === 'split') {
    const img = (
      <button
        onClick={() => openLightbox([block.asset], 0)}
        className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <img src={block.asset} alt={block.heading || ''} loading="lazy" decoding="async" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        <span className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
    );
    const txt = (
      <div className="flex flex-col justify-center">
        {block.heading && <h3 className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">{block.heading}</h3>}
        {block.body && <p className="mt-4 font-body text-[15px] font-light leading-relaxed text-white/70">{block.body}</p>}
      </div>
    );
    return (
      <Reveal className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2 md:gap-12">
        {block.side === 'right' ? <>{txt}{img}</> : <>{img}{txt}</>}
      </Reveal>
    );
  }

  if (t === 'fullbleed') {
    return (
      <Reveal className="mx-auto max-w-6xl px-3 sm:px-6">
        <button onClick={() => openLightbox([block.asset], 0)} className="group relative block w-full overflow-hidden rounded-2xl border border-white/10">
          <img src={block.asset} alt={block.caption || ''} loading="lazy" decoding="async" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        </button>
        {block.caption && <p className="mt-3 px-1 font-sans text-xs text-white/45">{block.caption}</p>}
      </Reveal>
    );
  }

  if (t === 'gallery') {
    const items = block.items || [];
    return (
      <Reveal className="mx-auto max-w-6xl px-3 sm:px-6">
        {block.caption && <p className="mb-4 px-1 font-sans text-xs uppercase tracking-[0.2em] text-white/45">{block.caption}</p>}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((src, i) => (
            <button
              key={src}
              onClick={() => openLightbox(items, i)}
              className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </button>
          ))}
        </div>
      </Reveal>
    );
  }

  if (t === 'gif') {
    return (
      <Reveal className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <img src={block.asset} alt={block.caption || ''} loading="lazy" className="mx-auto w-full object-contain" />
        </div>
        {block.caption && <p className="mt-3 font-sans text-xs text-white/45">{block.caption}</p>}
      </Reveal>
    );
  }

  if (t === 'video') {
    return (
      <Reveal className={`mx-auto px-6 ${block.portrait ? 'max-w-sm' : 'max-w-4xl'}`}>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <SmartVideo src={block.asset} portrait={block.portrait} className="w-full" />
        </div>
        {block.caption && <p className="mt-3 font-sans text-xs text-white/45">{block.caption}</p>}
      </Reveal>
    );
  }

  if (t === 'videoGrid') {
    const items = block.items || [];
    return (
      <Reveal className="mx-auto max-w-5xl px-6">
        {block.caption && <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-white/45">{block.caption}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((src) => (
            <div key={src} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <SmartVideo src={src} className="w-full" />
            </div>
          ))}
        </div>
      </Reveal>
    );
  }

  if (t === 'embed') {
    return (
      <Reveal className="mx-auto max-w-6xl px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ height: 'min(78vh, 720px)' }}>
          <iframe src={block.asset} title="Interactive tour" loading="lazy" allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking" className="h-full w-full" />
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="font-sans text-xs text-white/45">{block.caption || 'Drag to look around the space'}</p>
          <a href={block.asset} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-sans text-xs text-white/60 hover:text-white">
            Open fullscreen <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </Reveal>
    );
  }

  return null;
}

/* ── Top bar (AN home + nav) ── */
function TopBar({ title }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[300] flex items-center justify-between px-4 py-4 sm:px-7">
      <button
        onClick={goHome}
        title="Back to home"
        className="group pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 backdrop-blur-xl transition hover:bg-white/12"
      >
        <span className="font-display text-base font-extrabold tracking-tight text-white">AN<span className="text-white/40">.</span></span>
        <Home className="h-3.5 w-3.5 text-white/45 transition group-hover:text-white/80" />
      </button>

      <div className="pointer-events-auto hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] px-2 py-1.5 backdrop-blur-xl sm:flex">
        <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }} className="rounded-full px-4 py-1.5 font-sans text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); goWork(); }} className="rounded-full px-4 py-1.5 font-sans text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">Work</a>
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = '#contact'; }} className="rounded-full px-4 py-1.5 font-sans text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">Contact</a>
      </div>

      <button
        onClick={goWork}
        className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 font-sans text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/12"
      >
        <ArrowLeft className="h-4 w-4" /> All work
      </button>
    </div>
  );
}

/* ── Hero ── */
function Hero({ project, reduced }) {
  const { heroType, hero, title, tag, summary, accent, year, client, role, location, tools } = project;
  const isLogoHero = !hero || hero.includes('/_logo') || heroType === 'logo' || heroType === 'embed';
  const fullMedia = !isLogoHero && (heroType === 'image' || heroType === 'gif' || heroType === 'video');

  return (
    <header className="relative flex min-h-[92vh] w-full items-end overflow-hidden">
      {/* media or branded gradient */}
      {fullMedia ? (
        heroType === 'video' ? (
          <video src={hero} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <motion.img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={reduced ? false : { scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
          />
        )
      ) : (
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 30% 15%, ${accent}55, #0a0908 65%)` }}>
          {project.thumb && (
            <img src={project.thumb} alt="" className="absolute left-1/2 top-1/2 max-h-[40%] max-w-[40%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-90" />
          )}
        </div>
      )}

      {/* scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/55 to-[#0a0908]/20" />
      <div className="absolute inset-0" style={{ background: `radial-gradient(90% 60% at 15% 100%, ${accent}26, transparent 60%)` }} />

      {/* copy */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 sm:pb-20">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">{tag}</span>
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
            {title}
          </h1>
          {summary && <p className="mt-5 max-w-xl font-body text-base font-light leading-relaxed text-white/75 sm:text-lg">{summary}</p>}

          {/* meta row */}
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[['Role', role], ['Year', year], ['Client', client], ['Location', location]]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/40">{k}</div>
                  <div className="mt-1 font-sans text-sm font-medium text-white/85">{v}</div>
                </div>
              ))}
            {tools && tools.length > 0 && (
              <div>
                <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-white/40">Tools</div>
                <div className="mt-1 font-sans text-sm font-medium text-white/85">{tools.join(', ')}</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

/* ── Page ── */
export default function ProjectPage({ slug }) {
  const reduced = useReducedMotion();
  const project = PROJECT_BY_SLUG[slug];
  const [lb, setLb] = useState(null); // { items, index }

  const openLightbox = useCallback((items, index) => setLb({ items, index }), []);
  const navLightbox = useCallback((d) => {
    setLb((p) => (p ? { ...p, index: (p.index + d + p.items.length) % p.items.length } : p));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  // Free body scroll in case we deep-linked here while the home loader still
  // held its scroll lock (the loader lives in the hidden main tree).
  useEffect(() => { document.body.style.overflow = ''; }, []);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-ink text-white">
        <p className="font-display text-2xl font-bold">Project not found</p>
        <button onClick={goWork} className="rounded-full border border-white/20 px-5 py-2.5 text-sm hover:bg-white/10">Back to work</button>
      </div>
    );
  }

  const intro = project.intro;
  const nextProj = PROJECT_BY_SLUG[project.next];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink text-white">
      <TopBar title={project.title} />
      <Hero project={project} reduced={reduced} />

      {/* intro */}
      {intro && (
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-body text-lg font-light leading-relaxed text-white/80 sm:text-2xl sm:leading-relaxed">
              {intro}
            </p>
          </Reveal>
        </section>
      )}

      {/* blocks */}
      <div className="flex flex-col gap-16 pb-24 sm:gap-24">
        {project.blocks.map((block, i) => (
          <Block key={i} block={block} accent={project.accent} openLightbox={openLightbox} />
        ))}
      </div>

      {/* next project */}
      {nextProj && (
        <button onClick={() => goProject(nextProj.slug)} className="group relative block w-full overflow-hidden border-t border-white/10 bg-white/[0.02] py-16 text-left transition hover:bg-white/[0.04]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6">
            <div>
              <div className="font-sans text-[11px] uppercase tracking-[0.28em] text-white/40">Next project</div>
              <div className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{nextProj.title}</div>
              <div className="mt-2 font-sans text-sm text-white/50">{nextProj.tag}</div>
            </div>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/20 text-white transition group-hover:translate-x-1" style={{ background: `${nextProj.accent}22` }}>
              <ArrowRight className="h-6 w-6" />
            </span>
          </div>
        </button>
      )}

      {/* footer */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <button onClick={goHome} className="font-display text-lg font-extrabold tracking-tight text-white">AN<span className="text-white/40">.</span></button>
          <p className="font-sans text-xs text-white/40">Adel Naufer, Designer and Art Director</p>
          <button onClick={goWork} className="inline-flex items-center gap-2 font-sans text-sm text-white/60 hover:text-white">
            All work <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {lb && <Lightbox items={lb.items} index={lb.index} onClose={() => setLb(null)} onNav={navLightbox} />}
      </AnimatePresence>
    </div>
  );
}
