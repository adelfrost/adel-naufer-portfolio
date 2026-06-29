import { forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Effect } from 'postprocessing';
import { Uniform } from 'three';

// Radial / zoom motion blur — strength driven live by the car's speed. At
// strength 0 every sample collapses onto the source pixel, so it's a clean
// passthrough (no cost to "off").
const fragment = `
uniform float strength;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 dir = (uv - vec2(0.5)) * strength;
  vec4 sum = inputColor;
  sum += texture(inputBuffer, uv - dir * 0.25);
  sum += texture(inputBuffer, uv - dir * 0.5);
  sum += texture(inputBuffer, uv - dir * 0.75);
  sum += texture(inputBuffer, uv - dir);
  outputColor = sum / 5.0;
}
`;

class MotionBlurEffect extends Effect {
  constructor() {
    super('MotionBlurEffect', fragment, { uniforms: new Map([['strength', new Uniform(0)]]) });
  }
}

export const MotionBlur = forwardRef(({ blurRef }, ref) => {
  const effect = useMemo(() => new MotionBlurEffect(), []);
  useFrame(() => {
    effect.uniforms.get('strength').value = blurRef.current || 0;
  });
  return <primitive ref={ref} object={effect} dispose={null} />;
});
