import { useEffect } from 'react';

/**
 * BACKUP — site-wide depth of field effect.
 * Removed from App.jsx because CSS filter on sections forces GPU rasterisation
 * of each section layer, which adds overhead that competes with video seeks
 * (especially the Artworks llama scrub).
 *
 * To re-enable: import this hook in App.jsx and call it inside App():
 *   import { useSectionDepthOfField } from './hooks/useSectionDepthOfField';
 *   ...
 *   export default function App() {
 *     useSectionDepthOfField();
 *     ...
 *   }
 */
export function useSectionDepthOfField() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const sections = Array.from(document.querySelectorAll('main > section'));
    if (sections.length < 2) return undefined;

    sections.forEach((s, i) => {
      if (i === 0) return;
      s.style.transition = 'filter 0.45s ease';
      s.style.willChange = 'filter';
    });

    let raf = 0;
    const apply = () => {
      const vh = window.innerHeight;
      let focusIdx = 0;
      let maxVisible = -1;
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        if (visible > maxVisible) {
          maxVisible = visible;
          focusIdx = i;
        }
      });
      sections.forEach((s, i) => {
        if (i === 0) return; // Hero: never filtered (fixed navbar inside)
        if (s.id === 'projects') { s.style.filter = 'none'; return; } // Lamp sticky — filter on ancestor traps it
        const r = s.getBoundingClientRect();
        const visible = r.bottom > 0 && r.top < vh;
        if (i === focusIdx || !visible) {
          s.style.filter = 'none';
          return;
        }
        const d = Math.abs(i - focusIdx);
        s.style.filter = `blur(${Math.min(d * 3.5, 9)}px) brightness(${Math.max(1 - d * 0.12, 0.65)})`;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      sections.forEach((s) => {
        s.style.filter = 'none';
        s.style.willChange = '';
        s.style.transition = '';
      });
    };
  }, []);
}
