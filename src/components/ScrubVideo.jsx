import { useRef, useEffect, useState } from 'react';

/**
 * ScrubVideo — pointer/touch-scrubbed video backdrop.
 *
 * ── Delta scrub, seeked-chained ──────────────────────────────────────────
 * The video is paused. Horizontal pointer/touch movement scrubs the timeline:
 *   move RIGHT -> playhead advances  (llama gazes right / plays forward)
 *   move LEFT  -> playhead rewinds   (llama gazes left  / plays backward)
 * It's DELTA based — what matters is how far you move, not where the cursor
 * sits, so it feels like physically pushing the film. Only one seek is ever in
 * flight; while it decodes we remember the latest target (`pending`) and chase
 * it the moment `seeked` fires. No rAF loop, no gate that can wedge shut.
 *
 * ── Desktop vs. touch rendering ──────────────────────────────────────────
 * Desktop paints the <video> element directly (blob-preloaded into RAM).
 *
 * iOS WebKit, though, REFUSES to paint a paused-and-seeked <video> — it would
 * show blank. So on touch devices (`paintToCanvas`) we instead draw each seeked
 * frame onto a <canvas> (which captures the decoded frame regardless), after
 * priming the decoder with a muted play/pause on the first touch. The <video>
 * stays in the DOM (opacity 0) purely as the frame source. This is what makes
 * the llama both VISIBLE and finger-scrubbable on phones.
 */
export default function ScrubVideo({
  src,
  targetRef,          // API compat — scrub listens globally
  mode = 'scrub',
  sensitivity = 1,    // full viewport-width sweep traverses this fraction of the clip
  staticAt = 0.5,
  paintToCanvas = false,
  className = '',
  style,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [source, setSource] = useState(null);

  // ── Source: blob preload for desktop scrub; direct URL for auto/canvas ────
  // (iOS is unreliable with blob: video URLs, so the canvas path streams direct.)
  useEffect(() => {
    if (mode === 'auto' || paintToCanvas) { setSource(src); return undefined; }
    let blobUrl = null;
    let cancelled = false;
    fetch(src)
      .then((r) => r.blob())
      .then((blob) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setSource(blobUrl);
      })
      .catch(() => { if (!cancelled) setSource(src); });
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src, mode, paintToCanvas]);

  // ── Behaviour ────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return undefined;

    // AUTO — muted inline loop (reduced-motion fallback etc.) ────────────────
    if (mode === 'auto') {
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      const tryPlay = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
      tryPlay();
      video.addEventListener('loadeddata', tryPlay);
      const onGesture = () => tryPlay();
      window.addEventListener('touchstart', onGesture, { passive: true });
      window.addEventListener('click', onGesture);
      return () => {
        video.removeEventListener('loadeddata', tryPlay);
        window.removeEventListener('touchstart', onGesture);
        window.removeEventListener('click', onGesture);
        try { video.pause(); } catch (_) {}
      };
    }

    // STATIC ───────────────────────────────────────────────────────────────
    if (mode === 'static') {
      const seek = () => {
        const d = video.duration;
        if (d > 0 && isFinite(d)) video.currentTime = d * staticAt;
      };
      video.addEventListener('loadedmetadata', seek);
      if (video.readyState >= 1) seek();
      return () => video.removeEventListener('loadedmetadata', seek);
    }

    // SCRUB — delta, seeked-chained ────────────────────────────────────────
    const canvas = canvasRef.current;
    const ctx = paintToCanvas && canvas ? canvas.getContext('2d') : null;

    let duration = 0;
    let ready = false;
    let targetTime = 0;     // where we want the playhead (latest target)
    let prevX = null;
    let isSeeking = false;  // exactly one seek in flight
    let pending = false;    // target moved while a seek was decoding
    let primed = !paintToCanvas; // touch path must activate the decoder first

    const clampT = (t) => Math.min(Math.max(t, 0), duration - 0.05);

    // Paint the current decoded frame to the canvas (touch path only).
    const draw = () => {
      if (!ctx || video.readyState < 2) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;   // intrinsic size; CSS object-cover scales it like the video
        canvas.height = vh;
      }
      try { ctx.drawImage(video, 0, 0, vw, vh); } catch (_) { /* not decodable yet */ }
    };

    const doSeek = () => {
      if (!ready || isSeeking) return;
      isSeeking = true;
      video.currentTime = targetTime;
    };

    // When the in-flight seek finishes: paint it, then chase the newest target.
    const onSeeked = () => {
      isSeeking = false;
      draw();
      if (pending) { pending = false; doSeek(); }
    };

    const init = () => {
      if (ready) return;
      duration = video.duration || 0;
      ready = duration > 0 && isFinite(duration);
      if (!ready) return;
      targetTime = 0;        // llama starts from the left
      video.currentTime = 0;
    };

    // iOS won't decode a never-played video — prime it inside the first gesture.
    const prime = () => {
      if (primed) return;
      primed = true;
      const p = video.play();
      if (p && p.then) {
        p.then(() => { try { video.pause(); } catch (_) {} draw(); })
         .catch(() => { primed = false; });
      } else {
        try { video.pause(); } catch (_) {}
        draw();
      }
    };

    // pointermove covers mouse, pen and touch.
    const onPointerMove = (e) => {
      if (!ready) { prevX = e.clientX; return; }
      if (prevX === null) { prevX = e.clientX; return; }
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      if (dx === 0) return;
      targetTime = clampT(targetTime + (dx / (window.innerWidth || 1)) * duration * sensitivity);
      if (isSeeking) pending = true;
      else doSeek();
    };

    // Each fresh press / re-entry re-seeds the delta (and primes on touch).
    const onDown = () => { prevX = null; prime(); };
    const onReseed = () => { prevX = null; };

    video.addEventListener('loadedmetadata', init);
    video.addEventListener('canplay', init);
    video.addEventListener('loadeddata', draw);
    video.addEventListener('seeked', onSeeked);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseleave', onReseed);
    if (video.readyState >= 1) init();
    draw();

    return () => {
      video.removeEventListener('loadedmetadata', init);
      video.removeEventListener('canplay', init);
      video.removeEventListener('loadeddata', draw);
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('mouseleave', onReseed);
    };
  }, [source, mode, sensitivity, staticAt, paintToCanvas]);

  // Touch path: hidden <video> source + visible <canvas> that shows the frames.
  if (paintToCanvas && mode === 'scrub') {
    return (
      <>
        <video
          ref={videoRef}
          src={source || undefined}
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
          style={{ ...style, opacity: 0, pointerEvents: 'none' }}
          className={className}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={className}
          style={style}
        />
      </>
    );
  }

  return (
    <video
      ref={videoRef}
      src={source || undefined}
      muted
      playsInline
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
      className={className}
      style={style}
    />
  );
}
