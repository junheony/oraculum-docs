'use client'

import dynamic from 'next/dynamic'
import Navigation from '@/components/ui/Navigation'
import Hero from '@/components/ui/Hero'
import Features from '@/components/ui/Features'
import HowItWorks from '@/components/ui/HowItWorks'
import Stats from '@/components/ui/Stats'
import Footer from '@/components/ui/Footer'

// Dynamically import Canvas3D to avoid SSR issues with Three.js
const Canvas3D = dynamic(() => import('@/components/Canvas3D'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-violet-400 text-sm font-medium">Loading Oraculum...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* 3D Background */}
      <Canvas3D />

      {/* Navigation */}
      <Navigation />

      {/* Content Sections */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Footer />
      </div>
    </main>
  )
}
