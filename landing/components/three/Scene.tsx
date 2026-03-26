'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'
import GlowingOrb from './GlowingOrb'
import ParticleField from './ParticleField'
import EnergyStreams from './EnergyStreams'
import StarField from './StarField'

interface SceneProps {
  mousePosition: { x: number; y: number }
}

export default function Scene({ mousePosition }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame((state) => {
    // Subtle camera movement based on mouse
    const targetX = mousePosition.x * 0.5
    const targetY = mousePosition.y * 0.3

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.02)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 1, 0.02)
    camera.lookAt(0, 0, 0)

    // Gentle floating motion for the whole scene
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <>
      {/* Ambient and point lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#06b6d4" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffffff" distance={5} />

      {/* Main scene group */}
      <group ref={groupRef}>
        {/* Central glowing orb with floating animation */}
        <Float
          speed={2}
          rotationIntensity={0.2}
          floatIntensity={0.5}
        >
          <GlowingOrb position={[0, 0, 0]} scale={1.5} />
        </Float>

        {/* Particles orbiting around */}
        <ParticleField count={600} radius={5} />

        {/* Energy streams flowing to the orb */}
        <EnergyStreams count={16} />
      </group>

      {/* Background stars */}
      <StarField count={3000} depth={60} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 20, 60]} />
    </>
  )
}
