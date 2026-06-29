import { useEffect, useRef } from 'react';

/**
 * useJourneyControls — driving the DeLorean:
 *   forward : S / ↓                  (advance through the journey)
 *   reverse : W / ↑                  (go back)  — swapped to match car facing
 *   rise    : Space  OR  hold mouse  (gain altitude → fires the thrusters)
 * Returns a ref of booleans (read in the frame loop). `rise` is true when
 * either the spacebar or the pointer is held. `onFirstInput` fires once.
 */
export function useJourneyControls(onFirstInput) {
  const c = useRef({ forward: false, reverse: false, riseKey: false, risePointer: false });
  useEffect(() => {
    let touched = false;
    const first = () => {
      if (touched) return;
      touched = true;
      if (onFirstInput) onFirstInput();
    };

    const onPointerDown = () => { c.current.risePointer = true; first(); };
    const onPointerUp = () => { c.current.risePointer = false; };

    const map = (code, down) => {
      if (code === 'ArrowUp' || code === 'KeyW') c.current.forward = down;
      else if (code === 'ArrowDown' || code === 'KeyS') c.current.reverse = down;
      else if (code === 'Space') c.current.riseKey = down;
      else return false;
      return true;
    };
    const onKeyDown = (e) => { if (map(e.code, true)) { e.preventDefault(); first(); } };
    const onKeyUp = (e) => { map(e.code, false); };
    const reset = () => { c.current = { forward: false, reverse: false, riseKey: false, risePointer: false }; };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', reset);
    };
  }, [onFirstInput]);
  return c;
}
