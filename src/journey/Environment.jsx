import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { MILESTONES, JOURNEY_LENGTH } from './journeyData';

const rand = (a, b) => a + Math.random() * (b - a);
const DEG2RAD = Math.PI / 180;

const CITY_URL = '/models/cyberpunk_city.glb';
const MOUNTAIN_URL = '/models/mountains.glb';
const BIRDS_URL = '/models/birds.glb';
const PROP_URL = '/models/burj.glb';
const CLOUDS_PNG = ['/clouds/cloud1.webp', '/clouds/cloud3.webp', '/clouds/cloud5.webp', '/clouds/cloud7.webp', '/clouds/cloud9.webp'];

// ── Cyberpunk dusk sky gradient ────────────────────────────────────────────
export function makeSkyGradient() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, '#0a0a1f');
  g.addColorStop(0.4, '#241a44');
  g.addColorStop(0.66, '#6a2f63');
  g.addColorStop(0.84, '#c0506a');
  g.addColorStop(1.0, '#e98a5e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function useJourneyTextures() {
  return useMemo(() => ({ sky: makeSkyGradient() }), []);
}

export function Sky({ texture }) {
  return <primitive object={texture} attach="background" />;
}

function useFit(scene) {
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { center, maxDim: Math.max(size.x, size.y, size.z) || 1 };
  }, [scene]);
}

export function City({ sim, tuning, onReady }) {
  const { scene } = useGLTF(CITY_URL, '/draco/');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const fit = useFit(scene);
  const ref = useRef();
  const inv = 1 / fit.maxDim;
  // City only renders past Suspense once its GLTF is fully parsed (Draco
  // decoded), so this effect is a reliable "the city is in the scene" signal.
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[journey] city loaded · center', fit.center.toArray().map((n) => Math.round(n)), '· maxDim', Math.round(fit.maxDim));
    }
    if (onReady) onReady();
  }, [onReady]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = tuning.current.city;
    g.position.set(t.x, t.y, t.z);
    g.scale.setScalar(t.scale);
    g.rotation.y = -sim.current.dist * t.rot + 0.4;
  });
  return (
    <group ref={ref}>
      <primitive object={cloned} scale={inv} position={[-fit.center.x * inv, -fit.center.y * inv, -fit.center.z * inv]} />
    </group>
  );
}

export function MountainsBackdrop({ tuning }) {
  const { scene } = useGLTF(MOUNTAIN_URL, '/draco/');
  const fit = useFit(scene);
  const inv = 1 / fit.maxDim;
  const clone = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef();
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = tuning.current.mountains;
    g.position.set(t.x, t.y, t.z);
    g.scale.setScalar(t.scale);
  });
  return (
    <group ref={ref}>
      <primitive object={clone} scale={inv} position={[-fit.center.x * inv, -fit.center.y * inv, -fit.center.z * inv]} />
    </group>
  );
}

// ── Burj Khalifa (placeable prop, tuned via tuning.prop) ───────────────────
export function Prop({ tuning }) {
  const { scene } = useGLTF(PROP_URL, '/draco/');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const fit = useFit(scene);
  const inv = 1 / fit.maxDim;
  const ref = useRef();
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = tuning.current.prop;
    if (!t) { g.visible = false; return; }
    g.visible = t.scale > 0.01;
    g.position.set(t.x, t.y, t.z);
    g.scale.setScalar(t.scale);
    g.rotation.y = (t.ry || 0) * DEG2RAD;
  });
  return (
    <group ref={ref}>
      <primitive object={cloned} scale={inv} position={[-fit.center.x * inv, -fit.center.y * inv, -fit.center.z * inv]} />
    </group>
  );
}

// ── PNG cloud billboards drifting through the scene ────────────────────────
export function Clouds({ tuning }) {
  const maps = useTexture(CLOUDS_PNG);
  const refs = useRef([]);
  const aspects = useMemo(
    () => maps.map((m) => (m.image ? m.image.width / m.image.height : 2.2)),
    [maps]
  );
  const data = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: rand(-46, 46), y: rand(-5, 18), z: rand(-34, 16),
      s: rand(9, 24), speed: rand(0.4, 1.4) * (i % 2 ? 1 : -1),
      tint: i % 3 === 0 ? '#d8b9e6' : i % 3 === 1 ? '#f3c39a' : '#cfd8ef',
      tex: i % CLOUDS_PNG.length,
    })),
    []
  );
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const tc = (tuning && tuning.current && tuning.current.clouds) || {};
    const sc = tc.scale != null ? tc.scale : 1;
    const ox = tc.x || 0;
    const oy = tc.y || 0;
    const oz = tc.z || 0;
    for (let i = 0; i < data.length; i += 1) {
      const m = refs.current[i];
      if (!m) continue;
      const c = data[i];
      c.x += c.speed * d;
      if (c.x > 52) c.x = -52;
      if (c.x < -52) c.x = 52;
      const asp = aspects[c.tex];
      m.position.set(c.x + ox, c.y + oy, c.z + oz);
      m.scale.set(c.s * sc, (c.s / asp) * sc, 1);
    }
  });
  return data.map((c, i) => {
    const map = maps[c.tex];
    const asp = aspects[c.tex];
    return (
      <sprite key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, c.y, c.z]} scale={[c.s, c.s / asp, 1]}>
        <spriteMaterial map={map} color={c.tint} transparent opacity={0.92} depthWrite={false} />
      </sprite>
    );
  });
}

// ── Birds — the animated flock, a few copies flying across the sky ─────────
export function Birds() {
  const { scene, animations } = useGLTF(BIRDS_URL);
  const fit = useFit(scene);
  const inv = 1 / fit.maxDim;
  const flocks = useMemo(
    () => Array.from({ length: 4 }, () => {
      const obj = skeletonClone(scene);
      const mixer = new THREE.AnimationMixer(obj);
      animations.forEach((a) => mixer.clipAction(a).play());
      return {
        obj, mixer,
        x: rand(-45, 45), y: rand(9, 30), z: rand(-58, -12),
        speed: rand(2.5, 5), s: rand(3, 6) * inv, ry: rand(-0.5, 0.5),
      };
    }),
    [scene, animations, inv]
  );
  const refs = useRef([]);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < flocks.length; i += 1) {
      const f = flocks[i];
      f.mixer.update(d);
      const m = refs.current[i];
      if (!m) continue;
      f.x += f.speed * d;
      if (f.x > 54) { f.x = -54; f.z = rand(-58, -12); f.y = rand(9, 30); }
      m.position.set(f.x, f.y, f.z);
    }
  });
  return flocks.map((f, i) => (
    <primitive key={i} ref={(el) => (refs.current[i] = el)} object={f.obj} position={[f.x, f.y, f.z]} rotation={[0, f.ry, 0]} scale={f.s} />
  ));
}

// ── Year portals — glowing rings the car flies through, one per milestone ──
export function Portals({ sim, tuning }) {
  const refs = useRef([]);
  const ats = useMemo(() => MILESTONES.map((m) => m.at), []);
  useFrame(() => {
    const off = sim.current.offset;
    const car = tuning.current.car;
    const p = tuning.current.portal || { x: 0, y: 0, z: 0, scale: 5, ry: 0 };
    for (let i = 0; i < ats.length; i += 1) {
      const m = refs.current[i];
      if (!m) continue;
      let rel = ((ats[i] - off) % JOURNEY_LENGTH + JOURNEY_LENGTH) % JOURNEY_LENGTH;
      if (rel > JOURNEY_LENGTH / 2) rel -= JOURNEY_LENGTH;
      if (Math.abs(rel) > 30) { m.visible = false; continue; }
      m.visible = true;
      m.position.set(car.x + p.x, car.y + p.y, car.z - rel * 3.4 + p.z);
      m.scale.setScalar(p.scale);
      m.rotation.y = (p.ry || 0) * DEG2RAD;
    }
  });
  return ats.map((_, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)}>
      <torusGeometry args={[1, 0.05, 18, 64]} />
      <meshStandardMaterial color="#2fd0ff" emissive="#2fd0ff" emissiveIntensity={2.4} metalness={0.3} roughness={0.3} toneMapped={false} />
    </mesh>
  ));
}

export function Rain({ tuning, lowPerf }) {
  const COUNT = lowPerf ? 650 : 2200;
  const geom = useMemo(() => {
    const pos = new Float32Array(COUNT * 2 * 3);
    for (let i = 0; i < COUNT; i += 1) {
      const x = rand(-50, 50);
      const y = rand(-14, 46);
      const z = rand(-40, 22);
      const len = rand(0.7, 1.6);
      pos.set([x, y, z, x + 0.25, y - len, z], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [COUNT]);
  const matRef = useRef();
  const groupRef = useRef();
  useFrame((_, dt) => {
    const intensity = tuning.current.weather ? tuning.current.weather.rain : 0;
    if (groupRef.current) groupRef.current.visible = intensity > 0.01;
    if (matRef.current) matRef.current.opacity = 0.4 * intensity;
    if (intensity <= 0.01) return;
    const d = Math.min(dt, 0.05);
    const arr = geom.attributes.position.array;
    const fall = 70 * d;
    for (let i = 0; i < arr.length; i += 6) {
      arr[i + 1] -= fall;
      arr[i + 4] -= fall;
      if (arr[i + 1] < -16) {
        const ny = rand(30, 46);
        const len = rand(0.7, 1.6);
        arr[i + 1] = ny;
        arr[i + 4] = ny - len;
      }
    }
    geom.attributes.position.needsUpdate = true;
  });
  return (
    <group ref={groupRef}>
      <lineSegments geometry={geom}>
        <lineBasicMaterial ref={matRef} color="#bcd4ff" transparent opacity={0.3} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export function SpeedLines({ speedRef, tuning }) {
  const N = 18;
  const groupRef = useRef();
  const matRef = useRef();
  const data = useMemo(
    () => Array.from({ length: N }, () => ({
      x: rand(-7, 7), y: rand(-1.5, 4.5), z: rand(-20, 8),
      len: rand(1.6, 3.8), sp: rand(0.8, 1.5),
    })),
    []
  );
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const spd = speedRef.current;
    const grp = groupRef.current;
    const t = tuning.current;
    if (grp) {
      grp.position.set(t.car.x, t.car.y + 1, t.car.z);
      grp.rotation.y = ((t.fx && t.fx.speedLineAngle) || 0) * DEG2RAD;
    }
    if (matRef.current) matRef.current.opacity = Math.max(0, spd - 0.3) * 1.1;
    if (spd <= 0.3) return;
    const arr = geom.attributes.position.array;
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < N; i += 1) {
      const ln = data[i];
      ln.z += (12 + spd * 55) * ln.sp * d;
      if (ln.z > 14) ln.z = -22;
      arr.set([ln.x, ln.y, ln.z - ln.len, ln.x, ln.y, ln.z], i * 6);
    }
    geom.attributes.position.needsUpdate = true;
  });
  return (
    <group ref={groupRef}>
      <lineSegments geometry={geom}>
        <lineBasicMaterial ref={matRef} color="#eaf3ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

useGLTF.preload(CITY_URL, '/draco/');
useGLTF.preload(MOUNTAIN_URL, '/draco/');
useGLTF.preload(BIRDS_URL);
useGLTF.preload(PROP_URL, '/draco/');
