'use client'

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

const particleVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Orbital movement around center
    float angle = uTime * aSpeed + aOffset;
    float radius = length(pos.xz);
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;

    // Vertical oscillation
    pos.y += sin(uTime * aSpeed * 2.0 + aOffset) * 0.5;

    // Slight inward pull
    vec3 toCenter = normalize(-pos);
    pos += toCenter * sin(uTime * 0.5 + aOffset) * 0.3;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size based on distance
    float sizeAttenuation = 1.0 / -mvPosition.z;
    gl_PointSize = aSize * uPixelRatio * 100.0 * sizeAttenuation;

    // Alpha based on distance from center
    float distFromCenter = length(pos);
    vAlpha = smoothstep(8.0, 2.0, distFromCenter) * 0.8;

    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;

  varying float vAlpha;

  void main() {
    // Circular particle shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft glow
    float glow = 1.0 - dist * 2.0;
    glow = pow(glow, 2.0);

    // Color variation
    vec3 color = mix(uColor1, uColor2, sin(uTime * 0.5) * 0.5 + 0.5);

    gl_FragColor = vec4(color, glow * vAlpha);
  }
`

interface ParticleFieldProps {
  count?: number
  radius?: number
}

export default function ParticleField({ count = 500, radius = 6 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    const offsets = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.5 + Math.random() * 0.5)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5 // Flatten vertically
      positions[i * 3 + 2] = r * Math.cos(phi)

      sizes[i] = Math.random() * 0.5 + 0.2
      speeds[i] = Math.random() * 0.3 + 0.1
      offsets[i] = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))

    const unis = {
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      uColor1: { value: new THREE.Color('#06b6d4') }, // Cyan
      uColor2: { value: new THREE.Color('#8b5cf6') }, // Violet
    }

    return { geometry: geo, uniforms: unis }
  }, [count, radius])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
