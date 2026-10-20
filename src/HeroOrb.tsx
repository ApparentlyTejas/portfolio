import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Orb() {
  const mesh = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame(({ clock, pointer, camera }) => {
    const t = clock.getElapsedTime()
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.08 + pointer.x * 0.25
      mesh.current.rotation.x = pointer.y * 0.15
    }
    if (inner.current) {
      inner.current.rotation.y = -t * 0.05
    }
    const scrollT = Math.min(window.scrollY / (window.innerHeight * 0.9), 1)
    camera.position.z = 6.2 + scrollT * 2.5
    camera.position.y = -scrollT * 1.1
  })

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh ref={mesh} scale={2.1}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color="#3d6fd8"
          roughness={0.12}
          metalness={0.65}
          distort={0.32}
          speed={1.4}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh ref={inner} scale={1.25}>
        <icosahedronGeometry args={[1, 16]} />
        <MeshDistortMaterial
          color="#8b6cf0"
          roughness={0.05}
          metalness={0.8}
          distort={0.45}
          speed={1.1}
          transparent
          opacity={0.55}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  )
}

export default function HeroOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} color="#aecbff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#bc8cff" />
      <Suspense fallback={null}>
        <Orb />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
