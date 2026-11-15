import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Line, Sparkles } from '@react-three/drei'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

const BLUE = '#5b7cff'
const GOLD = '#ffa62b'

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
  useFrame(({ camera, pointer, clock }) => {
    const frac = getScrollFraction()
    const targetZ = CAMERA_Z_START - frac * CAMERA_TRAVEL
    const breathe = Math.sin(clock.getElapsedTime() * 0.18) * 0.04
    camera.position.z += (targetZ - camera.position.z) * 0.07
    camera.position.x += (pointer.x * 0.4 - camera.position.x) * 0.045
    camera.position.y += (-frac * 0.55 + pointer.y * 0.2 + breathe - camera.position.y) * 0.045
    camera.lookAt(0, camera.position.y * 0.3, camera.position.z - 8)
  })
  return null
}

function useReveal(stopZ: number, falloff = 4.5) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ camera }) => {
    if (!ref.current) return
    const targetCameraZ = stopZ + CAMERA_Z_START
    const dist = Math.abs(camera.position.z - targetCameraZ)
    const linear = Math.max(0, 1 - dist / falloff)
    const focus = linear * linear
    ref.current.visible = focus > 0.04
    ref.current.scale.setScalar(0.84 + focus * 0.16)
  })
  return ref
}

const TRANSMISSION_PROPS = {
  resolution: 320,
  samples: 2,
  thickness: 0.6,
  roughness: 0.08,
  chromaticAberration: 0.015,
  anisotropy: 0.02,
  envMapIntensity: 1,
  clearcoat: 1,
  clearcoatRoughness: 0.15,
  ior: 1.4,
}

/* Hero: a faceted gem with a glass core and two thin orbiting accent rings */
function HomeStop({ theme }: { theme: 'dark' | 'light' }) {
  const groupRef = useReveal(STOPS.home)
  const gemRef = useRef<THREE.Mesh>(null)
  const ringARef = useRef<THREE.Mesh>(null)
  const ringBRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime()
    if (gemRef.current) {
      gemRef.current.rotation.y = t * 0.08 + pointer.x * 0.15
      gemRef.current.rotation.x = pointer.y * 0.08
    }
    if (ringARef.current) ringARef.current.rotation.z = t * 0.12
    if (ringBRef.current) ringBRef.current.rotation.x = t * -0.09
  })

  return (
    <group ref={groupRef} position={[0, 0, STOPS.home]}>
      <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh ref={gemRef} scale={1.35}>
          <icosahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial
            {...TRANSMISSION_PROPS}
            color={theme === 'light' ? '#dfe6ff' : '#2a3568'}
            thickness={0.9}
          />
        </mesh>
        <mesh ref={ringARef} rotation={[Math.PI / 2.6, 0, 0]}>
          <torusGeometry args={[2.1, 0.006, 8, 120]} />
          <meshBasicMaterial color={BLUE} toneMapped={false} />
        </mesh>
        <mesh ref={ringBRef} rotation={[0, 0, Math.PI / 3.2]}>
          <torusGeometry args={[2.5, 0.004, 8, 120]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.45} />
        </mesh>
      </Float>
      <Sparkles count={26} scale={6} size={1.3} speed={0.25} color={BLUE} opacity={0.4} />
    </group>
  )
}

/* About: a slow-turning wireframe polyhedron, a quiet structural motif */
function AboutStop() {
  const groupRef = useReveal(STOPS.about)
  const meshRef = useRef<THREE.LineSegments>(null)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1, 1)), [])
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.09
      meshRef.current.rotation.y += delta * 0.07
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.about - 1.6]}>
      <lineSegments ref={meshRef} scale={1.3}>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color={GOLD} transparent opacity={0.55} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

/* Skills: a constellation, nodes linked by thin lines, turning as one body */
const SKILL_COUNT = 6

function SkillsStop() {
  const groupRef = useReveal(STOPS.skills)
  const clusterRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (clusterRef.current) clusterRef.current.rotation.y += delta * 0.09
  })

  const nodes = useMemo(() => {
    return Array.from({ length: SKILL_COUNT }, (_, i) => {
      const angle = (i / SKILL_COUNT) * Math.PI * 2
      const r = 1.9
      return new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle * 1.4) * 0.5, Math.sin(angle) * r)
    })
  }, [])

  const edges = useMemo(() => {
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = []
    for (let i = 0; i < nodes.length; i++) {
      pairs.push([nodes[i], nodes[(i + 1) % nodes.length]])
      pairs.push([nodes[i], new THREE.Vector3(0, 0, 0)])
    }
    return pairs
  }, [nodes])

  return (
    <group ref={groupRef} position={[0, 0, STOPS.skills - 1.8]}>
      <group ref={clusterRef}>
        {edges.map(([a, b], i) => (
          <Line key={i} points={[a, b]} color={i % 2 === 0 ? BLUE : GOLD} transparent opacity={0.15} lineWidth={1} />
        ))}
        {nodes.map((p, i) => (
          <mesh key={i} position={p} scale={0.15}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? BLUE : GOLD}
              emissive={i % 2 === 0 ? BLUE : GOLD}
              emissiveIntensity={0.7}
              roughness={0.25}
              metalness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* Projects: a small grid of glass panels catching the environment light */
const PROJECT_POSITIONS: Array<[number, number]> = [
  [-1.3, 0.9],
  [1.3, 0.9],
  [-1.3, -0.9],
  [1.3, -0.9],
]

function ProjectsStop() {
  const groupRef = useReveal(STOPS.projects)
  const refs = useMemo(() => PROJECT_POSITIONS.map(() => ({ current: null as THREE.Mesh | null })), [])
  useFrame((state, delta) => {
    refs.forEach((r, i) => {
      if (r.current) {
        r.current.rotation.y += delta * (0.05 + i * 0.015)
        r.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.25 + i) * 0.1
      }
    })
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.projects - 1.8]} scale={0.85}>
      {PROJECT_POSITIONS.map(([x, y], i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs[i].current = m
          }}
          position={[x, y, 0]}
          scale={[1.3, 0.85, 0.1]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <MeshTransmissionMaterial
            {...TRANSMISSION_PROPS}
            color={i % 2 === 0 ? '#1c2550' : '#3a2410'}
            thickness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

/* Timeline: a quiet line of glowing nodes, used for experience + education */
function TimelineStop({ z, count, color }: { z: number; count: number; color: string }) {
  const groupRef = useReveal(z)
  const points = useMemo(
    () => Array.from({ length: count }, (_, i) => new THREE.Vector3((i - (count - 1) / 2) * 1.6, 0, 0)),
    [count],
  )
  return (
    <group ref={groupRef} position={[0, 0, z]}>
      <Line points={points} color={color} transparent opacity={0.35} lineWidth={1} />
      {points.map((p, i) => (
        <mesh key={i} position={p} scale={0.16}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
        </mesh>
      ))}
      <Sparkles count={10} scale={[count * 1.6 + 1, 1, 1]} size={0.9} speed={0.15} color={color} opacity={0.3} />
    </group>
  )
}

/* Contact: a pulsing glass orb, the scene's closing note */
function ContactStop() {
  const groupRef = useReveal(STOPS.contact)
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime()
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06)
      meshRef.current.rotation.y += 0.003
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, STOPS.contact]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshTransmissionMaterial {...TRANSMISSION_PROPS} color="#20285a" thickness={0.8} />
      </mesh>
      <Sparkles count={20} scale={4} size={1.1} speed={0.2} color={GOLD} opacity={0.35} />
    </group>
  )
}

export default function Scene3D({ theme }: { theme: 'dark' | 'light' }) {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 720

  return (
    <div className="scene3d-canvas">
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z_START], fov: 38 }}
        dpr={isSmall ? [1, 1.2] : [1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={theme === 'light' ? 0.55 : 0.5} color={theme === 'light' ? '#ffffff' : '#1a2440'} />
        <directionalLight position={[4, 5, 4]} intensity={theme === 'light' ? 1.7 : 3.2} color="#ffffff" />
        <directionalLight position={[-5, 1, 2]} intensity={theme === 'light' ? 0.8 : 1.5} color="#ffb04d" />
        <directionalLight position={[-2, -3, -5]} intensity={theme === 'light' ? 1.1 : 2} color={BLUE} />
        <pointLight position={[0, 1, 5]} intensity={theme === 'light' ? 0.5 : 1} color="#ffffff" />
        <Environment preset={theme === 'light' ? 'apartment' : 'night'} resolution={256} />
        <CameraRig />
        <HomeStop theme={theme} />
        <AboutStop />
        <SkillsStop />
        <ProjectsStop />
        <TimelineStop z={STOPS.experience} count={2} color={GOLD} />
        <TimelineStop z={STOPS.education} count={2} color={BLUE} />
        <ContactStop />
      </Canvas>
    </div>
  )
}
