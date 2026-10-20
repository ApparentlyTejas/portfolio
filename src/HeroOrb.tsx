import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

const HUES = [0.6, 0.68, 0.76, 0.68]

function useCyclingColor(speed: number, offset: number) {
  const color = useRef(new THREE.Color())
  return (t: number) => {
    const cycle = ((t * speed + offset) % 1) * (HUES.length - 1)
    const i = Math.floor(cycle)
    const f = cycle - i
    const h = THREE.MathUtils.lerp(HUES[i], HUES[i + 1], f)
    color.current.setHSL(h, 0.42, 0.52)
    return color.current
  }
}

function Orb() {
  const mesh = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const getOuterColor = useCyclingColor(0.045, 0)
  const getInnerColor = useCyclingColor(0.045, 0.5)

  useFrame(({ clock, pointer, camera }) => {
    const t = clock.getElapsedTime()
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.08 + pointer.x * 0.25
      mesh.current.rotation.x = pointer.y * 0.15
      const mat = mesh.current.material as THREE.MeshStandardMaterial
      mat.color = getOuterColor(t)
    }
    if (inner.current) {
      inner.current.rotation.y = -t * 0.05
      const mat = inner.current.material as THREE.MeshStandardMaterial
      mat.color = getInnerColor(t)
    }
    const scrollT = Math.min(window.scrollY / (window.innerHeight * 0.9), 1)
    camera.position.z = 8 + scrollT * 2.5
    camera.position.y = -scrollT * 1.1
  })

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh ref={mesh} scale={1.3}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color="#3d6fd8"
          roughness={0.28}
          metalness={0.5}
          distort={0.34}
          speed={1.4}
        />
      </mesh>
      <mesh ref={inner} scale={0.78}>
        <icosahedronGeometry args={[1, 16]} />
        <MeshDistortMaterial
          color="#8b6cf0"
          roughness={0.25}
          metalness={0.5}
          distort={0.38}
          speed={1.0}
          transparent
          opacity={0.45}
        />
      </mesh>
    </Float>
  )
}

export default function HeroOrb() {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 720
  const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 38 }}
      dpr={isSmall ? [1, 1.2] : [1, 1.8]}
      gl={{ antialias: !isCoarse, alpha: true, powerPreference: 'low-power' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#aecbff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#bc8cff" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.3} color="#c9a8ff" />
      <Orb />
      {!isCoarse && (
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
