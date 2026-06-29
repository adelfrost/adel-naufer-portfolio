import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { preloadFont } from 'troika-three-text';
import { PROJECT_TEXTS } from './journeyItems';
import { JOURNEY_LENGTH } from './journeyData';

// Tall condensed display face (the Codrops "Humane"-style WebGL text look).
const FONT = '/fonts/BebasNeue-Regular.ttf';
preloadFont({ font: FONT, characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·-&' }, () => {});

const LEN = JOURNEY_LENGTH;
const SPACING = 3.4;
const VIS = 24;
const wrapDelta = (at, off) => {
  let r = ((at - off) % LEN + LEN) % LEN;
  if (r > LEN / 2) r -= LEN;
  return r;
};

/**
 * ProjectTexts — personal projects float by as crisp 3D display text (troika),
 * revealed by the distance travelled.
 */
export default function ProjectTexts({ sim, tuning }) {
  const refs = useRef([]);
  useFrame(() => {
    const off = sim.current.offset;
    const car = tuning.current.car;
    for (let i = 0; i < PROJECT_TEXTS.length; i += 1) {
      const pt = PROJECT_TEXTS[i];
      const m = refs.current[i];
      if (!m) continue;
      const rel = wrapDelta(pt.at, off);
      if (Math.abs(rel) > VIS) { m.visible = false; continue; }
      m.visible = true;
      m.position.set(car.x, car.y + pt.yOff, car.z - rel * SPACING);
      if (m.material) m.material.opacity = 1 - Math.min(Math.abs(rel) / VIS, 1);
    }
  });

  return PROJECT_TEXTS.map((pt, i) => (
    <Text
      key={i}
      ref={(el) => (refs.current[i] = el)}
      font={FONT}
      fontSize={1.85}
      letterSpacing={0.04}
      color="#f4f7ff"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.012}
      outlineColor="#0a0a1f"
      outlineBlur={0.1}
      material-transparent
      material-toneMapped={false}
    >
      {pt.text}
    </Text>
  ));
}
