import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Sky, City, MountainsBackdrop, Clouds, Birds, Rain, SpeedLines, Prop, Portals, useJourneyTextures } from './Environment';
import ProjectTexts from './Collectibles';
import { MILESTONES, JOURNEY_LENGTH } from './journeyData';

const MODEL_URL = '/models/delorean.glb';
const { clamp, lerp, DEG2RAD } = THREE.MathUtils;

function DeLorean() {
  const { scene } = useGLTF(MODEL_URL, '/draco/');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const { inv, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const i = 1 / maxDim;
    return { inv: i, offset: center.multiplyScalar(-i) };
  }, [cloned]);
  return <primitive object={cloned} scale={inv} position={offset} />;
}
useGLTF.preload(MODEL_URL, '/draco/');

function CarFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 0.28, 0.42]} />
      <meshStandardMaterial color="#c9ccd6" metalness={0.8} roughness={0.25} />
    </mesh>
  );
}

export default function JourneyScene({ controls, tuning, blurRef, startedRef, onProgress, onMilestone, onCityReady, lowPerf }) {
  const carRef = useRef();
  const sim = useRef({ dist: 0, offset: 0, speed: 0, holdY: 0, vel: 0, nudge: 0 });
  const speedRef = useRef(0);
  const lastMs = useRef(-1);
  const tex = useJourneyTextures();

  const ACCEL = 26;
  const MAX_SPEED = 17;
  const LIFT = 26;
  const GRAVITY = 13;
  const MAXV = 13;
  const HOLD_MAX = 7;

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const s = sim.current;
    const t = tuning.current;
    const c = controls.current;
    const started = startedRef.current;
    const rise = started && (c.riseKey || c.risePointer);

    if (started) {
      if (c.forward) s.speed += ACCEL * d;
      else if (c.reverse) s.speed -= ACCEL * d;
      else s.speed *= Math.pow(0.05, d);
    } else {
      s.speed *= Math.pow(0.02, d);
    }
    s.speed = clamp(s.speed, -MAX_SPEED, MAX_SPEED);
    const yearBoost = s.offset < 55 ? 1.8 : 1;
    s.dist += s.speed * yearBoost * d;
    s.offset = ((s.dist % JOURNEY_LENGTH) + JOURNEY_LENGTH) % JOURNEY_LENGTH;
    const sf = Math.min(Math.abs(s.speed) / MAX_SPEED, 1);
    speedRef.current = sf;
    if (blurRef) blurRef.current = sf * (t.fx ? t.fx.motionBlur : 0) * 0.32;

    s.vel += (rise ? LIFT : -GRAVITY) * d;
    s.vel = clamp(s.vel, -MAXV, MAXV);
    s.holdY = clamp(s.holdY + s.vel * d, 0, HOLD_MAX);
    if (s.holdY === 0 || s.holdY === HOLD_MAX) s.vel = 0;
    s.vel *= Math.pow(0.92, d * 60);

    s.nudge = lerp(s.nudge, clamp(s.speed * 0.045, -0.7, 0.7), 0.1);

    if (carRef.current) {
      const ry = (t.car.ry || 0) * DEG2RAD;
      const fwdX = -Math.sin(ry);
      const fwdZ = -Math.cos(ry);
      const bob = Math.sin(state.clock.elapsedTime * 1.3) * 0.22;
      carRef.current.position.set(
        t.car.x + fwdX * s.nudge,
        t.car.y + s.holdY + bob,
        t.car.z + fwdZ * s.nudge
      );
      carRef.current.scale.setScalar(t.car.scale);
      carRef.current.rotation.y = ry;
      carRef.current.rotation.x = lerp(carRef.current.rotation.x, (t.car.rx || 0) * DEG2RAD - s.speed * 0.012, 0.1);
      carRef.current.rotation.z = lerp(carRef.current.rotation.z, clamp(-s.vel * 0.03, -0.3, 0.3), 0.1);
    }

    state.camera.position.lerp(new THREE.Vector3(t.camera.x, t.camera.y + s.holdY * 0.1, t.camera.z), 0.06);
    state.camera.lookAt(t.car.x, t.camera.lookY + s.holdY * 0.2, t.camera.lookZ);

    // ease the FOV wider while driving forward (W / up) for a sense of speed
    const fwd = Math.max(0, s.speed) / MAX_SPEED;
    const targetFov = 50 + fwd * 8.5;
    if (Math.abs(state.camera.fov - targetFov) > 0.01) {
      state.camera.fov = lerp(state.camera.fov, targetFov, 0.08);
      state.camera.updateProjectionMatrix();
    }

    if (onProgress) onProgress(Math.min(s.offset / JOURNEY_LENGTH, 1), s.offset, speedRef.current);

    let idx = -1;
    for (let i = 0; i < MILESTONES.length; i += 1) {
      if (MILESTONES[i].at <= s.offset + 8) idx = i;
    }
    if (idx < 0) idx = lastMs.current;
    if (idx !== lastMs.current) {
      lastMs.current = idx;
      if (onMilestone) onMilestone(idx >= 0 ? MILESTONES[idx] : null, idx);
    }
  });

  return (
    <>
      <Sky texture={tex.sky} />
      <fogExp2 attach="fog" args={['#3a2350', 0.012]} />
      <Stars radius={160} depth={60} count={lowPerf ? 500 : 1800} factor={3} saturation={0} fade speed={0.5} />

      <hemisphereLight args={['#9fb6ff', '#2a1838', 0.7]} />
      <directionalLight position={[-12, 10, 6]} intensity={1.6} color="#ffd6b0" />
      <pointLight position={[-10, 2, 2]} intensity={120} distance={60} color="#ff3d7f" />
      <pointLight position={[12, 4, -4]} intensity={120} distance={60} color="#19c6ff" />
      <ambientLight intensity={lowPerf ? 0.55 : 0.35} />
      {!lowPerf && (
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <MountainsBackdrop tuning={tuning} />
        <City sim={sim} tuning={tuning} onReady={onCityReady} />
        <Prop tuning={tuning} />
        <Clouds tuning={tuning} />
        {!lowPerf && <Birds />}
        {!lowPerf && <Portals sim={sim} tuning={tuning} />}
      </Suspense>
      <Rain tuning={tuning} lowPerf={lowPerf} />
      <SpeedLines speedRef={speedRef} tuning={tuning} />
      {!lowPerf && (
        <Suspense fallback={null}>
          <ProjectTexts sim={sim} tuning={tuning} />
        </Suspense>
      )}

      <group ref={carRef}>
        <Suspense fallback={<CarFallback />}>
          <DeLorean />
        </Suspense>
      </group>
    </>
  );
}
