import { useScroll, useSpring, useTransform, motion } from 'motion/react';

/**
 * Lamp — a single clean violet edge-light at the Artworks↔Projects seam.
 *
 * Sticky h-0 → pins to the viewport top while the deck scrolls beneath; z-[2]
 * sits BEHIND the card content (z-10) so the glow only shows in the gap above
 * the cards, never washing over them. The inner band is height-capped and
 * bottom-masked so the cone dissolves well before the first card — no slab,
 * no overlap, no duplicate blobs (the two glows are concentric on the line).
 */
export default function Lamp({ targetRef }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end end'],
    layoutEffect: false, // ref is owned by the parent section — read after hydration
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 38, damping: 20, mass: 0.7 });

  const beamW   = useTransform(smooth, [0, 0.05, 0.9, 1], ['4rem', '40rem', '40rem', '4rem']);
  const glowW   = useTransform(smooth, [0, 0.05, 0.9, 1], ['5rem', '26rem', '26rem', '5rem']);
  const innerW  = useTransform(smooth, [0, 0.05, 0.9, 1], ['3rem', '12rem', '12rem', '3rem']);
  const opacity = useTransform(smooth, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
  const lineOpacity = useTransform(smooth, [0, 0.04, 0.92, 1], [0, 1, 1, 0]);

  const conic = {
    backgroundImage: 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 z-[2] h-0 w-full overflow-visible"
    >
      {/* contained band — bottom fade dissolves the cone before it reaches the cards */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '210px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 42%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 42%, transparent 100%)',
        }}
      >
        {/* left cone */}
        <motion.div
          style={{ width: beamW, opacity, ...conic }}
          className="absolute right-1/2 top-0 h-40 from-violet-400/40 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute bottom-0 left-0 h-24 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 h-full w-24 bg-ink [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* right cone */}
        <motion.div
          style={{ width: beamW, opacity, ...conic }}
          className="absolute left-1/2 top-0 h-40 from-transparent via-transparent to-violet-400/40 [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute bottom-0 right-0 h-full w-24 bg-ink [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 h-24 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* outer halo — concentric on the line (upper half clipped by the band top) */}
        <motion.div
          style={{ width: glowW, opacity }}
          className="absolute left-1/2 top-0 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/14 blur-3xl"
        />
        {/* inner halo — same centre, tighter & a touch brighter */}
        <motion.div
          style={{ width: innerW, opacity }}
          className="absolute left-1/2 top-0 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/22 blur-2xl"
        />

        {/* the bright seam line — full edge-to-edge, only opacity animates */}
        <motion.div
          style={{ opacity: lineOpacity }}
          className="absolute inset-x-0 top-0 h-px bg-violet-200/85 shadow-[0_0_16px_3px_rgba(196,181,253,0.45)]"
        />
      </div>
    </div>
  );
}
