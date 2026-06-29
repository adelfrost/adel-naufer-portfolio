import { useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';

// Smooth, slightly "settling" ease — matches the rest of the site (see Hero.jsx).
const EASE = [0.16, 1, 0.3, 1];

/**
 * BlurText
 * Per-letter heading reveal: every letter independently and staggered
 * left-to-right (1) fades opacity 0 -> 1, (2) slides up y: 24 -> 0,
 * (3) sharpens blur(10px) -> blur(0px).
 *
 * The heading element itself is the motion container that drives the
 * stagger via `staggerChildren` / `delayChildren`; each letter is a
 * child motion.span consuming shared variants.
 */
export default function BlurText({
  text,
  as = 'h3',
  className = '',
  delay = 0,
  stagger = 0.04,
  duration = 0.55,
  once = true,
  animateOn = 'view',
}) {
  // Build a motion-wrapped version of whatever heading tag was requested,
  // so the heading element drives the variants directly.
  //
  // motion/react v11 has NO `motion.create()` (that is the v12 factory API).
  // In v11 the factory is the indexed accessor `motion[tag]` (e.g. motion.h3).
  // We look it up dynamically and fall back to motion.h3 for an unknown tag.
  const MotionTag = useMemo(() => motion[as] || motion.h3, [as]);

  const ref = useRef(null);
  // For 'view' mode: trigger once 30% of the heading is on screen.
  const inView = useInView(ref, { once, amount: 0.3 });

  // 'mount' animates immediately; 'view' waits for scroll-into-view.
  const isActive = animateOn === 'mount' ? true : inView;

  // Container variants: hidden/visible carry the stagger timing.
  // delayChildren converts the incoming ms `delay` into seconds.
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay / 1000,
      },
    },
  };

  // Per-letter variants: the actual fade + rise + de-blur.
  const letter = {
    hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration, ease: EASE },
    },
  };

  // Split into words first so a word never breaks across a line mid-letter
  // (each word is its own inline-block unit). Real spaces are emitted as
  // text nodes between word spans to preserve natural spacing/wrapping.
  const words = useMemo(() => String(text).split(' '), [text]);

  return (
    <MotionTag
      ref={ref}
      aria-label={text}
      className={className}
      variants={container}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
    >
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`}>
          {/* The word: an inline-block keeps all its letters on one line.
              aria-hidden here also hides the decorative per-letter spans
              from assistive tech (it inherits to descendants). */}
          <span aria-hidden="true" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {Array.from(word).map((char, ci) => (
              <motion.span
                key={ci}
                variants={letter}
                style={{
                  display: 'inline-block',
                  willChange: 'transform, filter, opacity',
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          {/* Real space text node between words (not after the last word). */}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </MotionTag>
  );
}
