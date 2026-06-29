import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A self-contained warp-speed line field (own WebGL canvas), tuned to the
// journey's cyberpunk palette. Used as the loading backdrop and the
// return-to-home transition. Auto-warps at a steady speed, no interaction.
const PRESET = {
  length: 420,
  roadWidth: 11,
  speed: 2.4,
  background: 0x0a0a1f,
  left: [0xd856bf, 0x6750a2, 0xc247ac],
  right: [0x2fd0ff, 0x19c6ff, 0x0e5ea5],
};

export default function Hyperspeed({ className }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch (_) {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PRESET.background);
    scene.fog = new THREE.Fog(PRESET.background, 40, 420);

    const camera = new THREE.PerspectiveCamera(95, 1, 0.1, 10000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 3, -60);

    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    const COUNT = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 6);
    const colors = new Float32Array(COUNT * 6);
    const seed = () => {
      for (let i = 0; i < COUNT; i += 1) {
        const z = Math.random() * PRESET.length;
        const r = PRESET.roadWidth + Math.random() * 24;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r * 0.55 + 2.5;
        const len = 8 + Math.random() * 46;
        const idx = i * 6;
        positions[idx] = x; positions[idx + 1] = y; positions[idx + 2] = -z;
        positions[idx + 3] = x; positions[idx + 4] = y; positions[idx + 5] = -(z + len);
        const set = i % 2 === 0 ? PRESET.left : PRESET.right;
        const c = new THREE.Color(set[(Math.random() * set.length) | 0]);
        colors[idx] = c.r; colors[idx + 1] = c.g; colors[idx + 2] = c.b;
        colors[idx + 3] = c.r; colors[idx + 4] = c.g; colors[idx + 5] = c.b;
      }
    };
    seed();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array;
      const adv = PRESET.speed * 6.5;
      for (let i = 0; i < COUNT; i += 1) {
        const idx = i * 6;
        pos[idx + 2] += adv;
        pos[idx + 5] += adv;
        if (pos[idx + 2] > 24) {
          const nz = PRESET.length;
          const len = 8 + Math.random() * 46;
          pos[idx + 2] = -nz;
          pos[idx + 5] = -(nz + len);
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className || ''}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
