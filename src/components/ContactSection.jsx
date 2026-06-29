import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Linkedin, Instagram, ArrowUpRight, Send, Calendar } from 'lucide-react';
import GlowingEffect from './GlowingEffect';

/* ── Crossfade-loop video ──────────────────────────────────────────────
   Two stacked <video> elements playing the SAME clip. As the visible one
   nears its end, the other starts from 0 and we dissolve between them, then
   swap roles. Because the incoming layer is already showing the clip's first
   frames, the loop never cuts to black — it cross-dissolves seamlessly.      */
function CrossfadeVideo({ src, className }) {
  const aRef = useRef(null);
  const bRef = useRef(null);
  const frontIsA = useRef(true);
  const arming = useRef(false);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const FADE = 1.0; // seconds: crossfade window + CSS opacity transition

    a.style.opacity = '1';
    b.style.opacity = '0';
    a.play().catch(() => {});

    const tick = () => {
      const front = frontIsA.current ? a : b;
      const back = frontIsA.current ? b : a;
      if (!front.duration || arming.current) return;
      if (front.duration - front.currentTime <= FADE) {
        arming.current = true;
        back.currentTime = 0;
        back.play().catch(() => {});
        // dissolve
        front.style.opacity = '0';
        back.style.opacity = '1';
        frontIsA.current = !frontIsA.current;
        // re-arm once the old front has looped back near its start
        window.setTimeout(() => { arming.current = false; }, FADE * 1000 + 120);
      }
    };

    a.addEventListener('timeupdate', tick);
    b.addEventListener('timeupdate', tick);
    return () => {
      a.removeEventListener('timeupdate', tick);
      b.removeEventListener('timeupdate', tick);
    };
  }, []);

  // NOTE: no native `loop` — the JS resets currentTime to 0 and replays each
  // layer right before it's faded back in. Native loop would snap the OUTGOING
  // layer to frame 0 mid-dissolve (a visible flash); the manual reset on the
  // INCOMING layer keeps the crossfade clean. Fade (700ms) finishes before the
  // outgoing clip ends, so it dissolves out rather than hard-cutting.
  const common = `${className} transition-opacity duration-700 ease-linear`;
  return (
    <>
      <video ref={aRef} src={src} autoPlay muted playsInline aria-hidden="true" className={common} />
      <video ref={bRef} src={src} muted playsInline aria-hidden="true" className={common} />
    </>
  );
}

const EASE = [0.16, 1, 0.3, 1];
const SPRING = { type: 'spring', stiffness: 240, damping: 30, mass: 0.8 };

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4';

// Replace with your Google Calendar appointment scheduling link once set up at
// calendar.google.com → "Appointment schedules" → share link
const CALENDAR_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ-placeholder?gv=true';

const SOCIALS = [
  {
    Icon: Linkedin,
    label: "LET'S CONNECT",
    sub: 'LinkedIn',
    href: 'https://www.linkedin.com/in/adel-naufer/',
  },
  {
    Icon: Instagram,
    label: 'FOLLOW ME',
    sub: 'Instagram · Personal',
    href: 'https://www.instagram.com/adel_naufer/',
  },
  {
    Icon: Instagram,
    label: 'EXPLORE ZAVI',
    sub: 'Instagram · Studio',
    href: 'https://www.instagram.com/zavi.inc/',
  },
];

const CONTACT_ROWS = [
  { label: 'EMAIL', value: 'mail.adhilnaufer@gmail.com', href: 'mailto:mail.adhilnaufer@gmail.com' },
  { label: 'ALT EMAIL', value: 'adhil_eL@live.co.uk', href: 'mailto:adhil_eL@live.co.uk' },
  { label: 'LOCATION', value: 'Doha, Qatar', href: null },
];

/* ── Navbar-style glass card (light, low-opacity, subtle blur) ── */
function GlassCard({ children, className = '', delay = 0, reduced }) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/[0.10] bg-white/[0.055] p-5 backdrop-blur-[11px] md:rounded-3xl md:p-6 ${className}`}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.12)' }}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── 3D tilt form card — same treatment as CoreCard / ProjectCard ── */
function FormCard({ children, reduced, delay = 0.1 }) {
  const tiltRef = useRef(null);
  const spotRef = useRef(null);

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * 5).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 5).toFixed(2)}deg`);
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
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={{ perspective: '1200px' }}
      onMouseMove={reduced ? undefined : onMove}
      onMouseEnter={reduced ? undefined : onEnter}
      onMouseLeave={reduced ? undefined : onLeave}
    >
      <div
        ref={tiltRef}
        className="relative rounded-2xl border border-white/[0.11] p-2 transition-transform duration-200 ease-out [transform-style:preserve-3d] md:rounded-3xl md:p-2.5"
        style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
      >
        <GlowingEffect spread={48} glow disabled={false} proximity={90} inactiveZone={0.01} borderWidth={2} />

        {/* navbar-style glass inner surface */}
        <div
          className="relative overflow-hidden rounded-xl bg-white/[0.055] p-5 backdrop-blur-[11px] [transform-style:preserve-3d] md:rounded-2xl md:p-6"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.10)' }}
        >
          {/* cursor spotlight */}
          <div
            ref={spotRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(280px circle at var(--x,50%) var(--y,50%), rgba(145,185,255,0.09), transparent 65%)',
            }}
          />

          {/* floating content layer */}
          <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const INPUT_CLS =
  'w-full rounded-lg border border-white/[0.11] bg-white/[0.06] px-3 py-2.5 text-sm text-white ' +
  'placeholder-white/25 outline-none transition-all duration-200 ' +
  'focus:border-white/25 focus:bg-white/[0.09] backdrop-blur-sm';

const LABEL_CLS = 'block text-[10px] font-medium uppercase tracking-[0.22em] text-white/38 mb-1.5';

export default function ContactSection() {
  const reduced = useReducedMotion();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/mail.adhilnaufer@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _cc: 'adhil_eL@live.co.uk',
          _captcha: 'false',
          _subject: `Portfolio message from ${form.name}`,
        }),
      });
      const data = await res.json();
      if (data.success === 'true' || data.success === true) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative w-full overflow-hidden bg-ink">
      {/* ── Video background — crossfade loop, never cuts to black ── */}
      <CrossfadeVideo
        src={VIDEO_SRC}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Top-only blend so the section eases in from Languages */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
      {/* Very light overall scrim — keeps the llama visible */}
      <div className="pointer-events-none absolute inset-0 bg-black/22" />
      {/* Soft left-side gradient so headline text stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/52 via-black/18 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 md:px-10 md:py-28">

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-14">

          {/* Left: headline */}
          <motion.div
            className="flex flex-col gap-6"
            initial={reduced ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.05 }}
          >
            <h2 className="font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold leading-[0.93] tracking-tight text-white">
              LET&apos;S<br />
              MAKE SOMETHING<br />
              MEMORABLE
            </h2>
            <p className="max-w-xs font-body text-[15px] leading-relaxed text-white/40">
              Open to creative collaborations, freelance work, and interesting conversations.
            </p>
          </motion.div>

          {/* Right: cards */}
          <div className="flex flex-col gap-4">

            {/* ── 3D Form card ── */}
            <FormCard reduced={reduced} delay={0.12}>
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
                SEND A NOTE
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cn-name" className={LABEL_CLS}>Name</label>
                    <input
                      id="cn-name"
                      name="name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cn-email" className={LABEL_CLS}>Email</label>
                    <input
                      id="cn-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cn-message" className={LABEL_CLS}>Your Message</label>
                  <textarea
                    id="cn-message"
                    name="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project..."
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>

                {status === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-400/18 bg-emerald-400/[0.08] px-3.5 py-2.5 text-[13px] text-emerald-300"
                  >
                    Message sent. I&apos;ll be in touch soon.
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-400/18 bg-red-400/[0.08] px-3.5 py-2.5 text-[13px] text-red-300"
                  >
                    Something went wrong. Email directly at mail.adhilnaufer@gmail.com
                  </motion.p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={reduced ? {} : { scale: 1.03 }}
                    whileTap={reduced ? {} : { scale: 0.96 }}
                    transition={SPRING}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_0_0_0] transition-shadow hover:shadow-[0_0_22px_rgba(255,255,255,0.16)] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </motion.button>

                  <motion.a
                    href={CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reduced ? {} : { scale: 1.02 }}
                    whileTap={reduced ? {} : { scale: 0.97 }}
                    transition={SPRING}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/16 bg-white/[0.055] px-5 py-2.5 text-sm font-medium text-white/72 backdrop-blur-sm transition-colors hover:border-white/28 hover:bg-white/[0.10] hover:text-white"
                  >
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                    Check Availability to book a call
                  </motion.a>
                </div>
              </form>
            </FormCard>

            {/* Social + Info row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Social links */}
              <GlassCard delay={0.22} reduced={reduced}>
                <div className="flex flex-col gap-2.5">
                  {SOCIALS.map(({ Icon, label, sub, href }) => (
                    <motion.a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={reduced ? {} : { x: 2 }}
                      transition={SPRING}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-white/[0.15] hover:bg-white/[0.07]"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.05]">
                        <Icon className="h-4 w-4 text-white/60" strokeWidth={1.75} />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-semibold tracking-[0.12em] text-white/88">{label}</span>
                        <span className="text-[10px] text-white/35">{sub}</span>
                      </div>
                      <ArrowUpRight
                        className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-white/25 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/50"
                        strokeWidth={2}
                      />
                    </motion.a>
                  ))}
                </div>
              </GlassCard>

              {/* Contact info */}
              <GlassCard delay={0.30} reduced={reduced}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
                  CONTACT
                </p>
                <div className="flex flex-col gap-4">
                  {CONTACT_ROWS.map(({ label, value, href }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/28">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          className="break-all text-[12px] text-white/60 transition-colors hover:text-white"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-[12px] text-white/60">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom-right byline */}
      <p className="absolute bottom-5 right-6 z-10 text-[10px] font-medium tracking-[0.18em] text-white/28 select-none">
        Designed &amp; Developed by Adel Naufer
      </p>
    </section>
  );
}
