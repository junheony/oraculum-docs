'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const starVertexShader = `
  attribute float aSize;
  attribute float aTwinkle;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vTwinkle;
  varying float vAlpha;

  void main() {
    vTwinkle = aTwinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size based on distance
    float sizeAttenuation = 1.0 / -mvPosition.z;
    gl_PointSize = aSize * uPixelRatio * 50.0 * sizeAttenuation;

    // Twinkle effect
    float twinkle = sin(uTime * aTwinkle * 3.0) * 0.3 + 0.7;
    vAlpha = twinkle;

    gl_Position = projectionMatrix * mvPosition;
  }
`

const starFragmentShader = `
  varying float vTwinkle;
  varying float vAlpha;

  void main() {
    // Star shape with glow
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Create a star-like glow
    float core = 1.0 - smoothstep(0.0, 0.15, dist);
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);

    float brightness = core + glow * 0.3;

    // Slight blue-white color
    vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 1.0, 1.0), core);

    gl_FragColor = vec4(color, brightness * vAlpha * 0.8);
  }
`

interface StarFieldProps {
  count?: number
  depth?: number
}

export default function StarField({ count = 2000, depth = 50 }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const twinkles = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute stars in a large sphere around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = depth * (0.3 + Math.random() * 0.7)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Varying sizes - most stars are small, few are bright
      const sizeRandom = Math.random()
      sizes[i] = sizeRandom < 0.9 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.6 + 0.4

      // Twinkle speed
      twinkles[i] = Math.random() * 2 + 0.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkles, 1))

    const unis = {
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    }

    return { geometry: geo, uniforms: unis }
  }, [count, depth])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    // Slow rotation for parallax effect
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
