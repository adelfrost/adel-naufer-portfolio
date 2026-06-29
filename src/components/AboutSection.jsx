import { motion } from 'motion/react';
import BlurText from './BlurText';
import GradualBlur from './GradualBlur';
import SpotlightReveal from './SpotlightReveal';
import { ABOUT, TIMELINE, STATUS } from '../data/about';

const ease = [0.16, 1, 0.3, 1];

function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #241a12 0%, #150f0a 55%, #0a0908 100%)' }}
    >
      {/* Portrait — desktop only, absolute right, behind content (z-0).
          overflow:visible so echo rings can spill left across the section. */}
      <div className="hidden md:block select-none absolute inset-0 z-0 overflow-visible pointer-events-none">
        <div className="relative mx-auto h-full max-w-[1536px] px-5 sm:px-8 md:px-10 overflow-visible">
          <div
            className="absolute right-0 top-0 h-[112%] w-[46%] lg:w-[44%] pointer-events-auto overflow-visible"
          >
            <SpotlightReveal
              mainSrc={ABOUT.spotlightMain}
              revealSrc={ABOUT.spotlightReveal}
              alt="Adel Naufer"
              imgClassName="w-full h-full object-cover object-top select-none"
              imgStyle={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.55))' }}
            />
          </div>
        </div>
      </div>

      {/* ───────── Designer / bio ───────── */}
      <div className="relative z-10 mx-auto max-w-[1536px] px-5 sm:px-8 md:px-10 pt-12 sm:pt-14 md:pt-16 pb-14 md:pb-24">
        <div className="relative z-10">
          {/* Headline — wide column so the slab line stays on one row */}
          <div className="md:max-w-[62%]">
          {/* Headline — per-letter blur-in */}
          <BlurText
            as="h2"
            text="DESIGNER"
            stagger={0.05}
            duration={0.6}
            className="font-display font-extrabold uppercase tracking-tight text-white leading-[0.95] text-[clamp(42px,7.4vw,92px)]"
          />
          <BlurText
            as="h3"
            text="WHO GIVES SOUL TO"
            stagger={0.025}
            delay={120}
            className="mt-1 font-slab font-semibold uppercase tracking-tight text-white leading-[1] text-[clamp(26px,5.2vw,70px)]"
          />
          <BlurText
            as="h3"
            text="BRANDS"
            stagger={0.05}
            delay={240}
            className="mt-1 font-slab font-semibold uppercase tracking-tight text-white leading-[1] text-[clamp(26px,5.2vw,70px)]"
          />
          </div>

          {/* Body column — narrower so it clears the large portrait */}
          <div className="md:max-w-[54%]">
          {/* Intro */}
          <FadeUp delay={0.15} className="mt-7 sm:mt-9 max-w-xl">
            <p className="font-body text-base sm:text-lg leading-relaxed text-white/90">{ABOUT.intro}</p>
          </FadeUp>

          {/* Portrait — mobile inline (below intro) */}
          <img
            src={ABOUT.spotlightMain}
            alt="Adel Naufer"
            draggable={false}
            className="md:hidden mx-auto mt-10 h-[42vh] w-auto object-contain select-none pointer-events-none"
          />

          {/* Long bio */}
          <FadeUp delay={0.1} className="mt-9 md:mt-12 max-w-2xl space-y-5">
            {ABOUT.bio.map((p, i) => (
              <p key={i} className="font-body text-sm sm:text-[15px] leading-relaxed text-white/75">
                {p}
              </p>
            ))}
            <p className="font-mono text-sm sm:text-base tracking-tight text-white/90 pt-1">{ABOUT.shatter}</p>
            <p className="font-body text-sm sm:text-[15px] leading-relaxed text-white/75">{ABOUT.bioAfter}</p>
          </FadeUp>
          </div>
        </div>
      </div>

      {/* ───────── SO FAR ───────── */}
      <div className="relative z-10 mx-auto max-w-[1536px] px-5 sm:px-8 md:px-10 pb-14 md:pb-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Timeline */}
          <div>
            <FadeUp>
              <p className="font-display text-xs font-bold uppercase tracking-[0.32em] text-white/80">THE JOURNEY</p>
            </FadeUp>
            <div className="mt-6 flex flex-col gap-4">
              {TIMELINE.map((t, i) => (
                <FadeUp key={i} delay={Math.min(i * 0.04, 0.3)}>
                  <div className="flex items-baseline gap-4">
                    <span className="w-9 shrink-0 font-body text-sm font-semibold tracking-wide text-white/85">{t.year}</span>
                    <span className="font-body text-sm leading-snug text-white/60">{t.text}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Status panel */}
          <div>
            <FadeUp>
              <p className="font-display text-xs font-bold uppercase tracking-[0.32em] text-white/80">RIGHT NOW</p>
            </FadeUp>
            <FadeUp delay={0.1}>
              {/* Slightly more opaque than .glass-warm so the status text stays
                  readable over the figure that passes behind this panel. */}
              <div className="glass-warm mt-6 rounded-[1.75rem] px-5 sm:px-7 py-1" style={{ background: 'rgba(18,13,9,0.66)' }}>
                {STATUS.map((s, i) => (
                  <div
                    key={s.key}
                    className={`grid grid-cols-1 gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6 ${
                      i < STATUS.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <span className="font-body text-[11px] font-light uppercase tracking-[0.2em] text-white/55">{s.key}</span>
                    <div>
                      <p className="font-body text-sm font-semibold text-white">{s.value}</p>
                      <p className="mt-1 font-body text-xs leading-relaxed text-white/55">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Soft optical seam into the next section */}
      <GradualBlur position="bottom" height="6rem" strength={2} divCount={6} curve="ease-out" exponential zIndex={20} />
    </section>
  );
}
