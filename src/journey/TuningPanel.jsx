import { useState } from 'react';

// [key, min, max, step] per group.
const FIELDS = {
  city: [['scale', 10, 500, 1], ['x', -100, 100, 0.5], ['y', -120, 60, 0.5], ['z', -200, 40, 0.5], ['rot', 0, 0.2, 0.005]],
  car: [['scale', 0.5, 16, 0.1], ['x', -30, 30, 0.2], ['y', -8, 30, 0.2], ['z', -30, 30, 0.2], ['ry', 0, 360, 1], ['rx', -40, 40, 1]],
  camera: [['x', -40, 40, 0.5], ['y', -15, 55, 0.5], ['z', 2, 90, 0.5], ['lookY', -15, 30, 0.5], ['lookZ', -70, 30, 0.5]],
  mountains: [['scale', 20, 700, 2], ['x', -150, 150, 1], ['y', -120, 60, 1], ['z', -300, -10, 2]],
  weather: [['rain', 0, 1, 0.05]],
  fx: [['motionBlur', 0, 1, 0.05], ['speedLineAngle', 0, 360, 5]],
  prop: [['scale', 0, 220, 1], ['x', -160, 160, 1], ['y', -120, 70, 1], ['z', -260, 60, 1], ['ry', 0, 360, 5]],
  portal: [['scale', 1, 22, 0.2], ['x', -22, 22, 0.5], ['y', -16, 22, 0.5], ['z', -22, 22, 0.5], ['ry', 0, 360, 5]],
  clouds: [['scale', 0.1, 6, 0.05], ['x', -80, 80, 1], ['y', -30, 30, 0.5], ['z', -60, 60, 1]],
};

/**
 * TuningPanel — dev-only sliders to position the city / car / camera /
 * mountains live, then Save the values to src/journey/tuning.json.
 */
export default function TuningPanel({ tuning }) {
  const [, force] = useState(0);
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState('');

  const set = (group, key, v) => {
    tuning.current[group][key] = v;
    force((n) => n + 1);
  };

  const save = async () => {
    try {
      const res = await fetch('/_save-tuning', { method: 'POST', body: JSON.stringify(tuning.current) });
      setSaved(res.ok ? 'Saved ✓' : 'Failed');
    } catch {
      setSaved('Failed');
    }
    setTimeout(() => setSaved(''), 1800);
  };

  const stop = (e) => e.stopPropagation();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        onPointerDown={stop}
        className="pointer-events-auto absolute right-3 top-16 z-[210] rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
      >
        ⚙ Tune
      </button>
    );
  }

  return (
    <div
      onPointerDown={stop}
      onPointerUp={stop}
      className="pointer-events-auto absolute right-3 top-16 z-[210] max-h-[80vh] w-64 overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-3 text-white shadow-2xl backdrop-blur-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Tuning</span>
        <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">✕</button>
      </div>

      {Object.entries(FIELDS).map(([group, fields]) => (
        <div key={group} className="mt-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300/80">{group}</div>
          {fields.map(([key, min, max, step]) => (
            <label key={key} className="mb-1.5 block">
              <div className="flex justify-between text-[11px] text-white/70">
                <span>{key}</span>
                <span className="tabular-nums text-white">{tuning.current[group][key]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={tuning.current[group][key]}
                onChange={(e) => set(group, key, +e.target.value)}
                className="h-1 w-full cursor-pointer accent-pink-400"
              />
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={save}
        className="mt-3 w-full rounded-lg bg-pink-500 py-2 text-sm font-semibold text-white transition hover:bg-pink-400"
      >
        {saved || 'Save to file'}
      </button>
      <p className="mt-1.5 text-[10px] leading-tight text-white/40">Writes src/journey/tuning.json. Dev only.</p>
    </div>
  );
}
