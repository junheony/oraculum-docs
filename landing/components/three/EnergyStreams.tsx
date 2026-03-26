'use client'

import { useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface StreamData {
  curve: THREE.CatmullRomCurve3
  speed: number
  offset: number
  color: string
}

interface EnergyStreamsProps {
  count?: number
}

function EnergyStream({ curve, speed, offset, color }: StreamData) {
  const [opacity, setOpacity] = useState(0.5)
  const points = useMemo(() => curve.getPoints(50), [curve])

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * speed + offset) * 0.3 + 0.5
    setOpacity(pulse)
  })

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={opacity}
    />
  )
}

export default function EnergyStreams({ count = 12 }: EnergyStreamsProps) {
  const streams = useMemo(() => {
    const streamData: StreamData[] = []
    const colors = [
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
      '#6366f1', // Indigo
      '#ec4899', // Pink
    ]

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 5 + Math.random() * 2

      // Start point far from center
      const startX = Math.cos(angle) * radius
      const startY = (Math.random() - 0.5) * 4
      const startZ = Math.sin(angle) * radius

      // Control points for curved path to center
      const mid1X = Math.cos(angle + 0.2) * radius * 0.6
      const mid1Y = startY + (Math.random() - 0.5) * 2
      const mid1Z = Math.sin(angle + 0.2) * radius * 0.6

      const mid2X = Math.cos(angle - 0.1) * radius * 0.3
      const mid2Y = (Math.random() - 0.5) * 1
      const mid2Z = Math.sin(angle - 0.1) * radius * 0.3

      // End near center (the orb)
      const endX = (Math.random() - 0.5) * 0.5
      const endY = (Math.random() - 0.5) * 0.5
      const endZ = (Math.random() - 0.5) * 0.5

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(mid1X, mid1Y, mid1Z),
        new THREE.Vector3(mid2X, mid2Y, mid2Z),
        new THREE.Vector3(endX, endY, endZ),
      ])

      streamData.push({
        curve,
        speed: 2 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
      })
    }

    return streamData
  }, [count])

  return (
    <group>
      {streams.map((stream, index) => (
        <EnergyStream key={index} {...stream} />
      ))}
    </group>
  )
}
