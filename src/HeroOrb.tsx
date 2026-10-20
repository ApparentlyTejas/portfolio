import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Orb() {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame(({ clock, pointer, camera }) => {
    const t = clock.getElapsedTime()
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.035 + pointer.x * 0.12
      mesh.current.rotation.x = pointer.y * 0.06
    }
    const scrollT = Math.min(window.scrollY / (window.innerHeight * 0.9), 1)
    camera.position.z = 8 + scrollT * 2
    camera.position.y = -scrollT * 0.8
  })

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.55}>
      <mesh ref={mesh} scale={1.5}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial
          color="#e4e6ea"
          roughness={0.16}
          metalness={0.55}
          distort={0.38}
          speed={1.3}
        />
      </mesh>
    </Float>
  )
}

export default function HeroOrb() {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 720

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 38 }}
      dpr={isSmall ? [1, 1.2] : [1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.5} color="#3a3a3e" />
      <directionalLight position={[4, 5, 4]} intensity={3.4} color="#ffffff" />
      <directionalLight position={[-5, 1, 2]} intensity={1.6} color="#c8ccd2" />
      <directionalLight position={[-2, -3, -5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[0, 1, 5]} intensity={1} color="#ffffff" />
      <Orb />
    </Canvas>
  )
}
