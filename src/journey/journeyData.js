// The journey spine — extracted from Adel's CV, in chronological order.
// `at` is the world-X position where the milestone reveals as the car flies past.
// Education first, then career; each carries the role, dates, a headline stat,
// and a short "what I did". Brands are revealed as collectibles at that stop.

export const JOURNEY_LENGTH = 430;

export const CHAPTERS = [
  { key: 'origins', title: 'Origins', at: 14, color: '#8fb1cb' },
  { key: 'rise', title: 'The Rise', at: 150, color: '#f0bf86' },
  { key: 'now', title: 'Luxury & Now', at: 300, color: '#ffd28a' },
];

export const MILESTONES = [
  // ── Chapter 1 — Origins ────────────────────────────────────────────────
  {
    at: 26, chapter: 'origins', kind: 'edu',
    title: 'School & Foundations', org: 'S. Thomas College · Sri Lanka', dates: '2000 – 2011',
    stat: 'Where it began', desc: 'Bandarawela, Sri Lanka — the start of the road.',
  },
  {
    at: 56, chapter: 'origins', kind: 'edu',
    title: '3D AutoCAD Certification', org: 'Open University, Colombo', dates: '2011 – 2013',
    stat: 'Civil-engineering 3D', desc: 'Technical drafting and 3D AutoCAD — the engineering eye.',
  },
  {
    at: 86, chapter: 'origins', kind: 'edu',
    title: 'HND · Graphics, Multimedia & Post', org: 'Wijaya Graphics · Sri Lanka', dates: '2012 – 2014',
    stat: 'The craft', desc: 'Formal design training across graphics, multimedia and post-production.',
  },
  {
    at: 120, chapter: 'origins', kind: 'job',
    title: 'AutoCAD Draftsman / Designer', org: 'Cool Planet · Sri Lanka', dates: '2014 – 2016',
    stat: 'First role', desc: 'Blueprints, visual merchandising, social and the company website — even set up the IT dept.',
    brands: ['cool-planet'],
  },

  // ── Chapter 2 — The Rise ───────────────────────────────────────────────
  {
    at: 162, chapter: 'rise', kind: 'job',
    title: 'Graphic Designer', org: 'Nourish Media · Doha', dates: '2016 – 2018',
    stat: '400+ clients', desc: 'End-to-end creative across luxury hospitality, automotive, retail & F&B — full pipeline, zero outsourcing.',
    brands: ['sheraton', 'audi', 'apple', 'best-western', 'qncc', 'ezdan', 'giordano', 'under-armour', 'al-meera', 'ucc-holding', 'jaidah-group'],
  },
  {
    at: 198, chapter: 'rise', kind: 'job',
    title: 'Project Manager', org: 'Bezingo Digital Agency · Dubai', dates: '2018 – 2019',
    stat: 'Team of 5', desc: 'Led web & design for global crypto/real-estate clients — designed Mall.Global and Jollibee UAE.',
    brands: ['jollibee'],
  },
  {
    at: 230, chapter: 'rise', kind: 'job',
    title: 'Senior Graphic Designer', org: 'Alpha Advertising · Doha', dates: '2019',
    stat: 'Qatar Rail', desc: '3D/2D layouts and a proposed UI for the Qatar Metro passenger experience; Qatar road-sign systems.',
    brands: ['alpha-advertising'],
  },
  {
    at: 262, chapter: 'rise', kind: 'job',
    title: 'Jr Art Director · Systems Designer', org: 'Alpina Group · Doha', dates: '2019 – 2020',
    stat: 'Mentored 6', desc: 'New brand identities and F&B packaging (Alpina Juice on shelves across Qatar); Creative Director for Menats.',
  },

  // ── Chapter 3 — Luxury & Now ───────────────────────────────────────────
  {
    at: 308, chapter: 'now', kind: 'job',
    title: 'Graphic Artist', org: 'InterContinental Doha Beach & Spa', dates: '2020 – 2024',
    stat: 'FIFA World Cup 2022', desc: 'Creative lead across 10+ restaurant brands; built Novecento & La Mar Beach; ran the entire WC 2022 campaign across 8 venues in-house.',
    brands: ['intercontinental', 'fifa', 'manko', 'doha-golf-club'],
  },
  {
    at: 344, chapter: 'now', kind: 'job',
    title: 'Cluster Graphic Designer', org: 'Le Royal Méridien Place Vendôme · Lusail', dates: '2025',
    stat: 'Agora Doha & La Vallée', desc: 'Brand guidelines for Agora Doha; full environmental branding and launch films for La Vallée Spa, all in-house.',
    brands: ['le-royal-meridien', 'agora-doha'],
  },
  {
    at: 384, chapter: 'now', kind: 'job',
    title: 'Graphic Designer', org: 'Falcon Gold Precious Metals · Doha', dates: '2025 – Present',
    stat: 'QAR 60–80k saved', desc: 'Built the brand from scratch, VVIP coin/bullion packaging, the web UI, a 360° virtual tour and a custom HRM, all in-house.',
    brands: [],
  },
  {
    at: 414, chapter: 'now', kind: 'finale',
    title: "Still leveling up", org: 'BSc Network & Software Eng · Cardiff Met', dates: '2024 – Present',
    stat: 'The road goes on', desc: 'Designer who codes, writes (Shatterlands), builds (Zavi Nexus), and ships. Let’s talk.',
  },
];
