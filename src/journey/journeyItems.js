import { JOURNEY_LENGTH } from './journeyData';

// Personal projects rendered as floating 3D text you pass on the way.
export const PROJECT_TEXTS = [
  'SHATTERLANDS',
  'ZAVI NEXUS · HRM',
  'SELF-HOSTED MEDIA SERVER',
  'MARKETING REPORTER',
  'VIRTUAL PHOTOGRAPHY',
  'ZAVI NEXUS · MRM',
].map((text, i, arr) => ({
  text,
  at: 46 + (i / arr.length) * (JOURNEY_LENGTH - 80),
  yOff: 3.6 + Math.sin(i * 1.3) * 2,
}));
