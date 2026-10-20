import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NODE_COUNT = 46
const CONNECT_DIST = 2.6
const RADIUS = 4.4

function useNetwork() {
  return useMemo(() => {
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODE_COUNT)
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi
      const r = RADIUS * (0.75 + Math.random() * 0.4)
      positions.push(
        new THREE.Vector3(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi),
        ),
      )
    }

    const edges: [number, number][] = []
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
          edges.push([i, j])
        }
      }
    }
    return { positions, edges }
  }, [])
}

function Edges({ positions, edges }: { positions: THREE.Vector3[]; edges: [number, number][] }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    edges.forEach(([a, b]) => {
      pts.push(positions[a].x, positions[a].y, positions[a].z)
      pts.push(positions[b].x, positions[b].y, positions[b].z)
    })
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [positions, edges])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#2b3658" transparent opacity={0.45} />
    </lineSegments>
  )
}

function Nodes({ positions }: { positions: THREE.Vector3[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    positions.forEach((p, i) => {
      const s = 1 + Math.sin(t * 1.4 + i) * 0.22
      dummy.position.copy(p)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
      <sphereGeometry args={[0.045, 10, 10]} />
      <meshBasicMaterial color="#8fb8ff" />
    </instancedMesh>
  )
}

function Pulse({ a, b, speed, offset, color }: { a: THREE.Vector3; b: THREE.Vector3; speed: number; offset: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = ((clock.getElapsedTime() * speed + offset) % 1)
    ref.current.position.lerpVectors(a, b, t)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = Math.sin(t * Math.PI)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.065, 8, 8]} />
      <meshBasicMaterial color={color} transparent />
    </mesh>
  )
}

function Scene() {
  const { positions, edges } = useNetwork()
  const group = useRef<THREE.Group>(null)

  const pulses = useMemo(() => {
    const picks: { a: THREE.Vector3; b: THREE.Vector3; speed: number; offset: number; color: string }[] = []
    const colors = ['#58a6ff', '#bc8cff', '#58a6ff', '#bc8cff']
    for (let i = 0; i < 7; i++) {
      const [a, b] = edges[Math.floor(Math.random() * edges.length)]
      picks.push({
        a: positions[a],
        b: positions[b],
        speed: 0.18 + Math.random() * 0.22,
        offset: Math.random(),
        color: colors[i % colors.length],
      })
    }
    return picks
  }, [positions, edges])

  useFrame(({ clock, pointer, camera }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.06 + pointer.x * 0.3
    group.current.rotation.x = pointer.y * 0.15

    const scrollT = Math.min(window.scrollY / (window.innerHeight * 0.9), 1)
    camera.position.z = 9 + scrollT * 5
    camera.position.y = -scrollT * 1.4
    group.current.rotation.z = scrollT * 0.3
  })

  return (
    <group ref={group}>
      <Edges positions={positions} edges={edges} />
      <Nodes positions={positions} />
      {pulses.map((p, i) => (
        <Pulse key={i} {...p} />
      ))}
    </group>
  )
}

export default function NetworkScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene />
    </Canvas>
  )
}
