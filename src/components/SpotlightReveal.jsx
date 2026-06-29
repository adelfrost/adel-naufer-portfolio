import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * SpotlightReveal — blob-cursor reveal.
 *
 * The base image (you) sits underneath as a normal <img>. A canvas on top
 * composites the reveal image (Iron Man) ONLY inside a gooey blob that follows
 * the cursor with lag and leaves speed-based fading trails (source-in compositing).
 * A second canvas behind the figure draws faint wave lines that drift and bend
 * gently toward the cursor.
 *
 * The base <img> keeps the exact className/style of the portrait it replaces, so
 * size, ratio and position are untouched.
 */
export default function SpotlightReveal({ mainSrc, revealSrc, alt, imgClassName, imgStyle }) {
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const revealRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const revealCanvas = revealRef.current;
    const waveCanvas = waveRef.current;
    if (!root || !revealCanvas || !waveCanvas) return;

    const rctx = revealCanvas.getContext('2d');
    const wctx = waveCanvas.getContext('2d');

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0;

    // pointer state (CSS px, relative to the container)
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
    const blob = { x: -9999, y: -9999 };
    let speed = 0;
    let presence = 0;            // 0..1 — fades the reveal in/out on enter/leave
    let presenceTarget = 0;
    const trail = [];            // recent blob positions {x,y}
    const TRAIL_LEN = 16;
    let baseR = 120;
    let t = 0;

    const revealImg = new Image();
    let revealReady = false;
    revealImg.onload = () => { revealReady = true; };
    revealImg.src = revealSrc;

    const resize = () => {
      const r = root.getBoundingClientRect();
      cw = r.width; ch = r.height;
      baseR = Math.min(cw, ch) * 0.18;
      for (const c of [revealCanvas, waveCanvas]) {
        c.width = Math.max(1, Math.round(cw * DPR));
        c.height = Math.max(1, Math.round(ch * DPR));
        c.style.width = cw + 'px';
        c.style.height = ch + 'px';
      }
      rctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      wctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    // object-cover + object-position:top, matching the base <img>.
    const coverRect = (iw, ih) => {
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      return { dx: (cw - dw) / 2, dy: 0, dw, dh };
    };

    // Track on WINDOW (not the element): the About bio sits at z-10 on top of the
    // z-0 portrait and would otherwise swallow every hover. We read the global
    // cursor and test whether it's inside the portrait box ourselves.
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      if (inside) {
        mouse.x = x; mouse.y = y;
        presenceTarget = 1;
        if (blob.x < -9000) { blob.x = x; blob.y = y; }
      } else {
        presenceTarget = 0;
      }
    };

    // ---- soft blob (feathered white disc) ----
    const blobDisc = (ctx, x, y, r, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.55, `rgba(255,255,255,${a * 0.92})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf;
    const render = () => {
      raf = requestAnimationFrame(render);
      // Portrait hidden (e.g. md:block collapses to display:none on mobile) -> 0x0.
      // Bail before any draw so drawImage() never gets a zero-size rect.
      if (cw < 1 || ch < 1) return;
      t += 0.016;

      // smooth pointer follow + speed
      presence += (presenceTarget - presence) * 0.12;
      blob.x += (mouse.x - blob.x) * 0.18;
      blob.y += (mouse.y - blob.y) * 0.18;
      const inst = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
      speed += (inst - speed) * 0.25;
      mouse.px = mouse.x; mouse.py = mouse.y;

      // ---- WAVE LINES (behind) ----
      wctx.clearRect(0, 0, cw, ch);
      const nmx = cw ? (blob.x / cw - 0.5) : 0;   // -0.5..0.5
      const nmy = ch ? (blob.y / ch - 0.5) : 0;
      const lines = 11;
      wctx.lineWidth = 1;
      for (let i = 0; i < lines; i++) {
        const baseY = (ch / (lines - 1)) * i;
        const amp = 10 + 6 * Math.sin(i * 0.7) + presence * 8;
        const bend = nmy * 26 * Math.sin((i / lines) * Math.PI); // gentle pull toward cursor row
        wctx.beginPath();
        for (let x = 0; x <= cw; x += 14) {
          const phase = t * 0.5 + i * 0.5 + nmx * 1.2;
          const y = baseY + bend + Math.sin(x * 0.012 + phase) * amp;
          x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
        }
        wctx.strokeStyle = `rgba(228,196,150,${0.09 + presence * 0.06})`;
        wctx.stroke();
      }

      // ---- REVEAL BLOB ----
      rctx.clearRect(0, 0, cw, ch);
      if (revealReady && presence > 0.001) {
        // trail: record positions, longer/spread-out when moving fast
        trail.unshift({ x: blob.x, y: blob.y });
        if (trail.length > TRAIL_LEN) trail.pop();

        // build the gooey mask: trail discs (small->faint) then the main disc
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          const k = 1 - i / TRAIL_LEN;                 // 1 = newest
          const r = baseR * (0.45 + 0.45 * k);
          const a = presence * 0.5 * k;
          blobDisc(rctx, p.x, p.y, r, a);
        }
        const mainR = baseR * (1 + Math.min(speed / 240, 0.5));
        blobDisc(rctx, blob.x, blob.y, mainR, presence);

        // clip the reveal image to the mask
        rctx.globalCompositeOperation = 'source-in';
        const { dx, dy, dw, dh } = coverRect(revealImg.naturalWidth, revealImg.naturalHeight);
        rctx.drawImage(revealImg, dx, dy, dw, dh);
        rctx.globalCompositeOperation = 'source-over';
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduced, revealSrc]);

  return (
    <div ref={rootRef} className="relative h-full w-full">
      {/* faint mouse-reactive wave lines, behind the figure (shows through the cut-out) */}
      <canvas ref={waveRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      {/* base image (you) — unchanged size/ratio/position */}
      <img src={mainSrc} alt={alt} draggable={false} className={`relative z-[1] ${imgClassName}`} style={imgStyle} />
      {/* reveal blob (Iron Man), clipped to the gooey cursor blob.
          No drop-shadow here — it would trail a shadow behind the moving blob. */}
      <canvas ref={revealRef} className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />
    </div>
  );
}
