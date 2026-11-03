import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const SPACING = 8
const STOPS = {
  home: 0,
  about: -SPACING,
  skills: -SPACING * 2,
  projects: -SPACING * 3,
  experience: -SPACING * 4,
  education: -SPACING * 5,
  contact: -SPACING * 6,
}
const CAMERA_Z_START = 8
const CAMERA_TRAVEL = -STOPS.contact

function getScrollFraction() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
}

function CameraRig() {
  useFrame(({ camera, pointer }) => {
    const frac = getScrollFraction()
    const targetZ = CAMERA_Z_START - frac * CAMERA_TRAVEL
    camera.position.z += (targetZ - camera.position.z) * 0.08
    camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05
    camera.position.y += (-frac * 0.6 + pointer.y * 0.18 - camera.position.y) * 0.05
    camera.lookAt(0, camera.position.y * 0.3, camera.position.z - 8)
  })
  return null
}

function useReveal(stopZ: number, falloff = 7) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ camera }) => {
    if (!ref.current) return
    const targetCameraZ = stopZ + CAMERA_Z_START
    const dist = Math.abs(camera.position.z - targetCameraZ)
    const focus = Math.max(0, 1 - dist / falloff)
    ref.current.visible = focus > 0.02
    ref.current.scale.setScalar(0.82 + focus * 0.18)
  })
  return ref
}

function HomeStop() {
  const groupRef = useReveal(STOPS.home)
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.035 + pointer.x * 0.12
      meshRef.current.rotation.x = pointer.y * 0.06
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.home]}>
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.55}>
        <mesh ref={meshRef} scale={1.5}>
          <icosahedronGeometry args={[1, 32]} />
          <MeshDistortMaterial color="#6d7fd4" roughness={0.16} metalness={0.55} distort={0.38} speed={1.3} />
        </mesh>
      </Float>
    </group>
  )
}

function AboutStop() {
  const groupRef = useReveal(STOPS.about)
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.18
      meshRef.current.rotation.y += delta * 0.12
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.about]}>
      <mesh ref={meshRef} scale={1.1}>
        <torusKnotGeometry args={[1, 0.32, 128, 24]} />
        <meshStandardMaterial color="#ffa62b" wireframe roughness={0.4} />
      </mesh>
    </group>
  )
}

const SKILL_COUNT = 5

function SkillsStop() {
  const groupRef = useReveal(STOPS.skills)
  const clusterRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (clusterRef.current) clusterRef.current.rotation.y += delta * 0.15
  })
  const items = useMemo(() => Array.from({ length: SKILL_COUNT }, (_, i) => i), [])
  return (
    <group ref={groupRef} position={[0, 0, STOPS.skills]}>
      <group ref={clusterRef}>
        {items.map((i) => {
          const angle = (i / SKILL_COUNT) * Math.PI * 2
          const r = 1.9
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, Math.sin(angle * 1.3) * 0.5, Math.sin(angle) * r]}
              scale={0.42}
            >
              <icosahedronGeometry args={[1, 8]} />
              <MeshDistortMaterial
                color={i % 2 === 0 ? '#5b7cff' : '#ffa62b'}
                distort={0.3}
                speed={1.6}
                roughness={0.25}
                metalness={0.4}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

const PROJECT_POSITIONS: Array<[number, number]> = [
  [-1.3, 0.9],
  [1.3, 0.9],
  [-1.3, -0.9],
  [1.3, -0.9],
]

function ProjectsStop() {
  const groupRef = useReveal(STOPS.projects)
  const refA = useRef<THREE.Mesh>(null)
  const refB = useRef<THREE.Mesh>(null)
  const refC = useRef<THREE.Mesh>(null)
  const refD = useRef<THREE.Mesh>(null)
  const refs = useMemo(() => [refA, refB, refC, refD], [])
  useFrame((state, delta) => {
    refs.forEach((r, i) => {
      if (r.current) {
        r.current.rotation.y += delta * (0.08 + i * 0.02)
        r.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3 + i) * 0.15
      }
    })
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.projects]}>
      {PROJECT_POSITIONS.map(([x, y], i) => (
        <RoundedBox key={i} ref={refs[i]} args={[1.5, 1, 0.14]} radius={0.08} position={[x, y, 0]}>
          <meshStandardMaterial
            color={i % 2 === 0 ? '#5b7cff' : '#ffa62b'}
            roughness={0.3}
            metalness={0.5}
            transparent
            opacity={0.85}
          />
        </RoundedBox>
      ))}
    </group>
  )
}

function TimelineStop({ z, count, color }: { z: number; count: number; color: string }) {
  const groupRef = useReveal(z)
  const points = useMemo(
    () => Array.from({ length: count }, (_, i) => new THREE.Vector3((i - (count - 1) / 2) * 1.6, 0, 0)),
    [count],
  )
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return (
    <group ref={groupRef} position={[0, 0, z]}>
      <line>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function ContactStop() {
  const groupRef = useReveal(STOPS.contact)
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime()
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.08)
      meshRef.current.rotation.y += 0.004
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.contact]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 16]} />
        <MeshDistortMaterial
          color="#5b7cff"
          distort={0.25}
          speed={2}
          roughness={0.2}
          metalness={0.6}
          emissive="#ffa62b"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  )
}

export default function Scene3D() {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 720

  return (
    <div className="scene3d-canvas">
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z_START], fov: 38 }}
        dpr={isSmall ? [1, 1.2] : [1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.5} color="#1a2440" />
        <directionalLight position={[4, 5, 4]} intensity={3.4} color="#ffffff" />
        <directionalLight position={[-5, 1, 2]} intensity={1.6} color="#ffb04d" />
        <directionalLight position={[-2, -3, -5]} intensity={2.2} color="#5b7cff" />
        <pointLight position={[0, 1, 5]} intensity={1} color="#ffffff" />
        <CameraRig />
        <HomeStop />
        <AboutStop />
        <SkillsStop />
        <ProjectsStop />
        <TimelineStop z={STOPS.experience} count={2} color="#ffa62b" />
        <TimelineStop z={STOPS.education} count={2} color="#5b7cff" />
        <ContactStop />
      </Canvas>
    </div>
  )
}
