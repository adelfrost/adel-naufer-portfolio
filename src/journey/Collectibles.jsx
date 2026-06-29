import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { PROJECT_TEXTS } from './journeyItems';
import { JOURNEY_LENGTH } from './journeyData';

const LEN = JOURNEY_LENGTH;
const SPACING = 3.4;
const VIS = 24;
const wrapDelta = (at, off) => {
  let r = ((at - off) % LEN + LEN) % LEN;
  if (r > LEN / 2) r -= LEN;
  return r;
};

/**
 * ProjectTexts — personal projects float by as 3D text, revealed by the
 * distance travelled. (Logos/skills collectibles removed.)
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
      fontSize={1.15}
      color="#ffe6f6"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="#3a1030"
      material-transparent
      material-toneMapped={false}
    >
      {pt.text}
    </Text>
  ));
}
