import { useState, useEffect } from 'react';

/* ── Live Qatar time (Asia/Qatar = GMT+3, no DST) ── */
function qTime() {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Qatar',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t)?.value || '00';
  return `${g('hour')} : ${g('minute')} : ${g('second')}`;
}
function qDate() {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Qatar',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t)?.value || '';
  return `${g('month')} ${g('day')} ${g('year')}`.toUpperCase();
}

const MOMENTS = [
  { k: 'Designing & Developing', items: [{ t: 'ZAVI NEBULA', s: 'MRM Software UI & Development\nalong with AI integrations' }] },
  { k: 'Writing', items: [{ t: 'CODE NAME — SHATTERLANDS', s: 'Action Adventure · Sci-fi ·\nRomantic Novel' }] },
  { k: 'Designing', items: [{ t: 'ZAVI BRAND GUIDELINES', s: 'Full-scale brand guidelines\nfor ZAVI · Computer systems' }] },
  {
    k: 'Recently shipped',
    items: [
      { t: 'Falcon Gold 360 Virtual Tour', s: '360 virtual tour custom coded,\npanorama images shot on iPhone' },
      { t: 'ZAVI NEXUS PROMO', s: 'Animated promo video\nof ZAVI NEXUS HRM' },
    ],
  },
];

export default function AtTheMomentBar() {
  const [time, setTime] = useState(qTime);
  const [date, setDate] = useState(qDate);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(qTime());
      setDate(qDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    /* Standalone band sitting between the hero and the about section.
       Gradient bridges the hero's dark base into the about's warm top. */
    <div className="relative w-full" style={{ background: 'linear-gradient(180deg, #0a0908 0%, #241a12 100%)' }}>
      <div className="glass-warm w-full rounded-[22px] px-4 py-5 sm:px-6 md:rounded-[34px] md:px-10 md:py-6">
        <div className="mx-auto flex max-w-[1536px] flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
          {/* Date / time */}
          <div className="shrink-0 lg:pr-10">
            <p className="text-[11px] font-light tracking-[0.34em] text-white md:text-[13px]">AT THE MOMENT</p>
            <p className="mt-2 text-base font-medium tracking-[0.2em] text-white md:mt-3 md:text-xl">{date}</p>
            <p className="mt-1.5 text-xs font-light tracking-[0.28em] text-white/85 md:text-sm">{time}</p>
          </div>

          {/* Moments — only ONE divider, between "Designing" and "Recently shipped" */}
          <div className="flex gap-0 overflow-x-auto pb-1 lg:flex-1 lg:overflow-visible lg:pl-10">
            {MOMENTS.map((m, idx) => (
              <div
                key={m.k}
                className={`flex shrink-0 ${idx > 0 ? 'ml-6 md:ml-9' : ''} ${idx === 3 ? 'border-l border-white/15 pl-6 md:pl-9' : ''}`}
              >
                <div>
                  <p className="text-xs font-light text-white/80 md:text-[13px]">{m.k}</p>
                  <div className="mt-3 flex gap-6 md:gap-8">
                    {m.items.map((it) => (
                      <div key={it.t}>
                        <p className="whitespace-nowrap text-xs font-semibold text-white md:text-sm">{it.t}</p>
                        <p className="mt-1.5 whitespace-pre-line text-[11px] font-light leading-snug text-white/55 md:text-xs">{it.s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
