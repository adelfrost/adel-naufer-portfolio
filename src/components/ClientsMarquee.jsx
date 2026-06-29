import { motion, useReducedMotion } from 'motion/react';
import {
  CLIENTS_ROW_1,
  CLIENTS_ROW_2,
  CLIENT_NAMES_1,
  CLIENT_NAMES_2,
} from '../data/clients';

const EASE = [0.16, 1, 0.3, 1];

const EDGE_FADE = {
  maskImage: 'linear-gradient(to right, transparent, black 7%, black 93%, transparent)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 7%, black 93%, transparent)',
};

/* One scrolling logo row. The track holds two identical copies of the set;
   CSS shifts it -50% so the loop is seamless. Each logo carries its own
   horizontal margin (no flex gap), which keeps the -50% maths exact. */
function LogoRow({ logos, duration, reverse, reduced }) {
  const copy = (keyPrefix, hidden = false) =>
    logos.map((logo, i) => (
      <img
        key={`${keyPrefix}-${logo.src}-${i}`}
        src={logo.src}
        alt={hidden ? '' : logo.alt}
        aria-hidden={hidden ? 'true' : undefined}
        width={160}
        height={48}
        loading="lazy"
        draggable={false}
        className="mx-7 h-8 w-auto max-w-[190px] shrink-0 select-none object-contain opacity-55 transition-opacity duration-300 hover:opacity-100 md:mx-10 md:h-10"
      />
    ));

  if (reduced) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-y-4 px-5">
        {copy('a')}
      </div>
    );
  }

  return (
    <div className="marquee-group flex w-full overflow-hidden">
      <div
        className="marquee-track flex w-max shrink-0 items-center"
        style={{ '--marquee-duration': `${duration}s`, '--marquee-direction': reverse ? 'reverse' : 'normal' }}
      >
        {copy('a')}
        <div aria-hidden="true" className="flex items-center">{copy('b')}</div>
      </div>
    </div>
  );
}

/* One scrolling row of client NAMES (typographic wordmarks). Every name carries
   a trailing dot, so the inter-name spacing is uniform across the -50% seam. */
function NameRow({ names, duration, reverse, reduced }) {
  const copy = (keyPrefix, hidden = false) =>
    names.map((name, i) => (
      <span key={`${keyPrefix}-${i}`} className="inline-flex shrink-0 items-center" aria-hidden={hidden ? 'true' : undefined}>
        <span className="whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[0.2em] text-white/35 transition-colors duration-300 hover:text-white/80 md:text-sm">
          {name}
        </span>
        <span aria-hidden="true" className="mx-5 h-[3px] w-[3px] shrink-0 rounded-full bg-white/20 md:mx-6" />
      </span>
    ));

  if (reduced) {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-y-1 px-5">
        {copy('a')}
      </div>
    );
  }

  return (
    <div className="marquee-group flex w-full overflow-hidden">
      <div
        className="marquee-track flex w-max shrink-0 items-center"
        style={{ '--marquee-duration': `${duration}s`, '--marquee-direction': reverse ? 'reverse' : 'normal' }}
      >
        {copy('a')}
        <div aria-hidden="true" className="flex items-center">{copy('b', true)}</div>
      </div>
    </div>
  );
}

export default function ClientsMarquee() {
  const reduced = useReducedMotion();

  return (
    // A plain band (not a <section>) so the site-wide depth-of-field never
    // blurs the logos as it scrolls between Languages and Contact.
    <div className="relative w-full overflow-hidden bg-ink py-16 md:py-20">
      <motion.p
        className="mb-9 px-5 text-center font-body text-[13px] font-medium uppercase tracking-[0.28em] text-white/35 md:mb-11"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        Trusted by 400+ brands across Qatar and beyond
      </motion.p>

      {/* Real logos */}
      <div className="flex flex-col gap-6 md:gap-8" style={EDGE_FADE}>
        <LogoRow logos={CLIENTS_ROW_1} duration={52} reverse={false} reduced={reduced} />
        <LogoRow logos={CLIENTS_ROW_2} duration={58} reverse reduced={reduced} />
      </div>

      {/* hairline divider into the name roster */}
      <div className="mx-auto my-9 h-px w-full max-w-[1100px] bg-white/[0.06] md:my-11" />

      {/* Long-tail roster as wordmarks */}
      <div className="flex flex-col gap-3.5 md:gap-4" style={EDGE_FADE}>
        <NameRow names={CLIENT_NAMES_1} duration={64} reverse reduced={reduced} />
        <NameRow names={CLIENT_NAMES_2} duration={70} reverse={false} reduced={reduced} />
      </div>
    </div>
  );
}
