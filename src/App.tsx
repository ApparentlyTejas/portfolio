import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import './App.css'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
]

const SKILLS = [
  {
    label: 'Backend & APIs',
    count: 6,
    items: ['Python', 'FastAPI / Flask', 'REST APIs', 'Pydantic', 'JWT Auth', 'MCP Servers'],
  },
  {
    label: 'Databases & Distributed Systems',
    count: 6,
    items: ['PostgreSQL', 'MySQL', 'Transactions', 'Isolation Levels', 'Locking', 'Concurrency Control'],
  },
  {
    label: 'AI & GenAI Tooling',
    count: 4,
    items: ['LLM API Integration (Groq / Llama 3.3 70B)', 'Schema-Validated Structured Output', 'Claude / Anthropic SDK', 'MCP Tool Design'],
  },
  {
    label: 'Cloud & DevOps',
    count: 7,
    items: ['AWS (EC2, S3, RDS, VPC, EKS)', 'Multi-tier deployments', 'Docker', 'GitHub Actions', 'GitLab CI/CD', 'Git', 'Load Testing (Locust)'],
  },
  {
    label: 'Full-Stack',
    count: 5,
    items: ['React', 'TypeScript', 'Vite', 'HttpOnly-Cookie Auth', 'C++'],
  },
]

const PROJECTS = [
  {
    category: 'mcp / backend',
    title: 'Incident Lens',
    desc: 'Role-aware, evidence-backed MCP server over BGL and OpenStack logs in SereneDB. Every answer traces back to a real query, with a hash-chained tamper-evident evidence ledger and row-level security per team.',
    bullets: [
      'Engineer / lead / manager role-split tooling: error investigation, recurring patterns, prioritized risk',
      'SHA-256 hash-chained evidence ledger, verifiable end to end',
      'Row-level security via per-team views + revoked grants (no native CREATE POLICY in SereneDB)',
      'Queried a billion-row remote OpenTelemetry Parquet dataset directly off S3',
    ],
    tags: ['Python', 'MCP', 'SereneDB', 'Claude'],
    github: 'https://github.com/ApparentlyTejas/incident-lens',
  },
  {
    category: 'backend / systems',
    title: 'RoomLock',
    desc: 'Concurrency-safe booking API. Found and reproduced a real double-booking race condition under concurrent load, then eliminated it two different ways and load-tested both.',
    bullets: [
      'SELECT FOR UPDATE row lock vs. GiST EXCLUDE constraint, compared head to head',
      'Locust load tests at 30 concurrent users: ~420 req/s → ~450-570 req/s, zero overlapping bookings',
      '66 automated pytest tests against a real PostgreSQL instance, including a 20-request concurrency race',
      'JWT auth with role-based access, fully containerized with Docker',
    ],
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Locust'],
    github: 'https://github.com/ApparentlyTejas/RoomLock',
    demo: 'https://bookingapi-i4cg.onrender.com/',
  },
  {
    category: 'ai / full-stack',
    title: 'ReviewLenzAI',
    desc: 'AI-powered GitHub PR review tool. Fetches a PR diff, sends it to an LLM with a structured tool-call schema, and returns typed, severity-ranked findings instead of free-form text.',
    bullets: [
      'Llama 3.3 70B via Groq, output validated with Pydantic schemas',
      'Multi-user isolation: HttpOnly-cookie auth, Fernet-encrypted GitHub tokens',
      'Independently deployed stack: React/TS on Vercel, FastAPI on Render, Postgres on Neon',
      '31 backend tests wired into GitHub Actions CI on every push',
    ],
    tags: ['Python', 'FastAPI', 'React', 'TypeScript', 'Groq'],
    github: 'https://github.com/ApparentlyTejas/ReviewLenzAI',
    demo: 'https://reviewlenzai.vercel.app',
  },
  {
    category: 'ai / mcp',
    title: 'DevPulse',
    desc: 'AI-powered engineering-ops platform for service monitoring, metrics, and incident management, exposed to Claude via MCP so an agent can investigate ops state directly.',
    bullets: [
      'Service health, metrics, and incident data surfaced as MCP tools',
      'Built for an agent to reason over live engineering-ops state, not just dashboards',
    ],
    tags: ['Python', 'MCP', 'Monitoring'],
    github: 'https://github.com/ApparentlyTejas/DevPulse',
  },
]

const EXPERIENCE = [
  {
    role: 'Cloud Intern',
    company: 'Parity Infotech Solutions',
    location: 'Bangalore, India',
    dates: '01/2024 – 05/2024',
    bullets: [
      'Contributed to AWS infrastructure (EC2, VPC, RDS, S3) supporting production workloads, applying reliability improvements to reduce downtime',
      'Built and maintained GitHub Actions and GitLab CI/CD pipelines automating build, test, and release workflows',
    ],
    tags: ['AWS', 'EC2', 'RDS', 'GitHub Actions', 'GitLab CI/CD'],
  },
  {
    role: 'IoT Intern',
    company: 'Parity Infotech Solutions',
    location: 'New Delhi, India',
    dates: '05/2023 – 08/2023',
    bullets: [
      'Built Python data-integration pipelines for sensor and IoT traffic data supporting smart-city applications',
      'Diagnosed and resolved 20+ performance-critical defects through systematic analysis of application logs and system metrics',
    ],
    tags: ['Python', 'IoT', 'Data Pipelines'],
  },
]

const EDUCATION = [
  {
    degree: 'M.Sc. Information and Communication Technology',
    school: 'Friedrich-Alexander-Universität Erlangen-Nürnberg',
    location: 'Erlangen, Germany',
    dates: '10/2025 – Present',
    bullets: ['Software engineering focus: distributed systems and backend development'],
  },
  {
    degree: 'B.Tech. Electronics and Communication Engineering',
    school: 'Manipal University Jaipur',
    location: 'Jaipur, India',
    dates: '09/2020 – 10/2024',
    bullets: ['IEEE MTT-S Winner'],
  },
]

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      <div className="section-inner">{children}</div>
    </section>
  )
}

function CommandHeader({ children }: { children: string }) {
  return (
    <h2 className="command-header">
      {children}
      <span className="command-cursor" aria-hidden="true" />
    </h2>
  )
}

const EASE = [0.16, 1, 0.3, 1] as const

function Reveal({ className, children }: { className: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

function StaggerGrid({ className, children }: { className: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage unavailable; fall through to system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 1 0 11 11z" />
        </svg>
      )}
    </button>
  )
}

const BOOT_LINES = [
  { cmd: '$ whoami', out: 'tejas_malhotra' },
  { cmd: '$ status --check', out: 'online // open to internships' },
  { cmd: '$ portfolio --init', out: 'done.' },
]

const BOOT_SEEN_KEY = 'boot-seen'

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length) {
      const t = setTimeout(onComplete, 350)
      return () => clearTimeout(t)
    }
    const line = BOOT_LINES[lineIndex].cmd
    if (charIndex < line.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 22)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setShowOutput(true), 120)
    return () => clearTimeout(t)
  }, [lineIndex, charIndex, onComplete])

  useEffect(() => {
    if (!showOutput) return
    const t = setTimeout(() => {
      setShowOutput(false)
      setCharIndex(0)
      setLineIndex((i) => i + 1)
    }, 260)
    return () => clearTimeout(t)
  }, [showOutput])

  return (
    <motion.div
      className="boot-overlay"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="boot-lines">
        {BOOT_LINES.slice(0, lineIndex).map((l) => (
          <div key={l.cmd} className="boot-line">
            <span className="boot-cmd">{l.cmd}</span>
            <span className="boot-out">{l.out}</span>
          </div>
        ))}
        {lineIndex < BOOT_LINES.length && (
          <div className="boot-line">
            <span className="boot-cmd">
              {BOOT_LINES[lineIndex].cmd.slice(0, charIndex)}
              <span className="command-cursor" aria-hidden="true" />
            </span>
            {showOutput && <span className="boot-out">{BOOT_LINES[lineIndex].out}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

type Command = {
  id: string
  label: string
  hint?: string
  run: () => void
}

function CommandPalette({ commands, onClose }: { commands: Command[]; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setHighlight(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && filtered[highlight]) {
      filtered[highlight].run()
      onClose()
    }
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <motion.div
        className="palette"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="palette-input-row">
          <span className="palette-prompt">$</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="type a command..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="palette-esc">esc</kbd>
        </div>
        <ul className="palette-list">
          {filtered.length === 0 && <li className="palette-empty">no matches</li>}
          {filtered.map((c, i) => (
            <li
              key={c.id}
              className={i === highlight ? 'active' : ''}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => {
                c.run()
                onClose()
              }}
            >
              <span>{c.label}</span>
              {c.hint && <span className="palette-hint">{c.hint}</span>}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

function useKonamiCode(onActivate: () => void) {
  useEffect(() => {
    let progress = 0
    const handler = (e: KeyboardEvent) => {
      const expected = KONAMI[progress]
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === expected) {
        progress += 1
        if (progress === KONAMI.length) {
          progress = 0
          onActivate()
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onActivate])
}

function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops = new Array(columns).fill(1)
    const chars = '01アイウエオカキクケコ{}[]<>/;=+'

    let frame: number
    const draw = () => {
      ctx.fillStyle = 'rgba(5, 7, 10, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#5b7cff'
      ctx.font = `${fontSize}px monospace`
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      })
      frame = requestAnimationFrame(draw)
    }
    draw()

    const timeout = setTimeout(onDone, 4200)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
    }
  }, [onDone])

  return (
    <motion.div
      className="matrix-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} />
      <div className="matrix-message">ACCESS GRANTED // nice, you found it</div>
    </motion.div>
  )
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let ticking = false
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0)
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

function MagneticLink({ className, href, target, rel, children }: {
  className: string
  href: string
  target?: string
  rel?: string
  children: React.ReactNode
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 })

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.a>
  )
}

/* A dependency-free 3D wireframe icosahedron, drawn with plain <canvas>
   trig/projection math — a geodesic "network" shape fits the distributed-
   systems brand, and it's a nicer flex than importing a 3D engine for it. */
const PHI = (1 + Math.sqrt(5)) / 2
const ICOSA_VERTICES: Array<[number, number, number]> = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
]
const ICOSA_EDGES: Array<[number, number]> = [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
  [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
  [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11],
  [5, 9], [5, 11],
  [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10],
  [8, 9],
  [10, 11],
]

function WireframeModel({ accent, accent2 }: { accent: string; accent2: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const size = canvas.clientWidth
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let angleX = 0.4
    let angleY = 0
    let frame: number
    let visible = true

    const render = () => {
      ctx.clearRect(0, 0, size, size)
      const scale = size * 0.32
      const cx = size / 2
      const cy = size / 2
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)

      const projected = ICOSA_VERTICES.map(([x, y, z]) => {
        const y1 = y * cosX - z * sinX
        const z1 = y * sinX + z * cosX
        const x2 = x * cosY - z1 * sinY
        const z2 = x * sinY + z1 * cosY
        const perspective = 4 / (4 + z2)
        return { x: cx + x2 * scale * perspective, y: cy + y1 * scale * perspective, z: z2 }
      })

      ctx.lineWidth = 1.2
      ICOSA_EDGES.forEach(([a, b]) => {
        const pa = projected[a]
        const pb = projected[b]
        const depth = (pa.z + pb.z) / 2
        const alpha = 0.35 + (1 - (depth + 2) / 4) * 0.5
        ctx.strokeStyle = accent
        ctx.globalAlpha = Math.max(0.15, Math.min(1, alpha))
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        ctx.stroke()
      })

      ctx.globalAlpha = 1
      projected.forEach((p) => {
        ctx.fillStyle = accent2
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2)
        ctx.fill()
      })

      if (!reduceMotion) {
        angleY += 0.006
        angleX += 0.0012
      }
      if (visible) frame = requestAnimationFrame(render)
    }
    render()

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      if (visible) frame = requestAnimationFrame(render)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [accent, accent2, reduceMotion])

  return <canvas ref={canvasRef} className="wireframe-canvas" aria-hidden="true" />
}

type TermLine =
  | { kind: 'input'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'render' }
  | { kind: 'neofetch' }

const PAGE_LOAD_TIME = Date.now()
const NEOFETCH_GLYPH = ['  /\\  ', ' /  \\ ', '/_/\\_\\', '\\    /', ' \\  / ', '  \\/  ']

function Neofetch({ theme }: { theme: Theme }) {
  const [uptimeSec] = useState(() => Math.max(0, Math.round((Date.now() - PAGE_LOAD_TIME) / 1000)))
  const rows: Array<[string, string]> = [
    ['user@host', 'tejas_malhotra@portfolio'],
    ['OS', 'PortfolioOS (React 19 + Vite)'],
    ['Host', 'github.com/ApparentlyTejas'],
    ['Languages', 'Python, TypeScript, C++'],
    ['Stack', 'FastAPI, PostgreSQL, Docker, AWS'],
    ['Theme', `${theme} (accent: blue/orange)`],
    ['Status', 'open to internships'],
    ['Uptime', `${uptimeSec}s this session`],
  ]
  return (
    <div className="neofetch">
      <pre className="neofetch-glyph" aria-hidden="true">{NEOFETCH_GLYPH.join('\n')}</pre>
      <div className="neofetch-rows">
        {rows.map(([k, v]) => (
          <div key={k} className="neofetch-row">
            <span className="neofetch-key">{k}</span>
            <span className="neofetch-val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InteractiveTerminal({
  theme,
  onGoto,
  onThemeChange,
  onMatrix,
}: {
  theme: Theme
  onGoto: (id: string) => void
  onThemeChange: (t: Theme) => void
  onMatrix: () => void
}) {
  const [lines, setLines] = useState<TermLine[]>([{ kind: 'neofetch' }])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  const print = (text: string) => setLines((l) => [...l, { kind: 'output', text }])

  const run = (raw: string) => {
    const cmd = raw.trim()
    setLines((l) => [...l, { kind: 'input', text: cmd }])
    if (!cmd) return
    const [name, ...args] = cmd.toLowerCase().split(/\s+/)

    switch (name) {
      case 'help':
        print('commands: whoami, neofetch, about, skills, projects, experience, education, contact, goto <section>, theme <dark|light>, render, matrix, ls, clear')
        break
      case 'neofetch':
        setLines((l) => [...l, { kind: 'neofetch' }])
        break
      case 'matrix':
        print('wake up...')
        onMatrix()
        break
      case 'whoami':
        print('tejas_malhotra — software engineer, M.Sc. ICT @ FAU Erlangen')
        break
      case 'about':
        print("I build across the stack and test things by actually breaking them. See the 'about' section below for the rest.")
        break
      case 'ls':
        print(NAV_LINKS.map((l) => l.label.toLowerCase()).join('  '))
        break
      case 'skills':
        print(SKILLS.map((s) => s.label).join(' · '))
        break
      case 'projects':
        PROJECTS.forEach((p) => print(`${p.title} — ${p.github}`))
        break
      case 'experience':
        print("See the 'experience' section below for the full timeline.")
        onGoto('experience')
        break
      case 'education':
        onGoto('education')
        print("Jumped to 'education'.")
        break
      case 'contact':
        print('tejas.malhotra.14@gmail.com · github.com/ApparentlyTejas · linkedin.com/in/tejasmalhotra410850207')
        break
      case 'theme':
        if (args[0] === 'light' || args[0] === 'dark') {
          onThemeChange(args[0])
          print(`theme set to ${args[0]}`)
        } else {
          print('usage: theme <dark|light>')
        }
        break
      case 'goto':
        if (args[0] && NAV_LINKS.some((l) => l.href === `#${args[0]}`)) {
          onGoto(args[0])
          print(`jumped to '${args[0]}'`)
        } else {
          print(`unknown section '${args[0] ?? ''}'. try: ${NAV_LINKS.map((l) => l.href.slice(1)).join(', ')}`)
        }
        break
      case 'render':
      case '3d':
        setLines((l) => [...l, { kind: 'render' }])
        break
      case 'sudo':
        print('nice try. permission denied.')
        break
      case 'clear':
        setLines([])
        return
      default:
        print(`command not found: ${name}. try 'help'`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      run(input)
      setHistory((h) => [...h, input])
      setHistoryIndex(null)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
  }

  return (
    <div className="terminal-box interactive" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-chrome">
        <span className="dot dot-red" />
        <span className="dot dot-yellow" />
        <span className="dot dot-green" />
        <span className="terminal-chrome-title">tejas@portfolio: ~</span>
      </div>
      <div className="terminal-body interactive-body" ref={bodyRef}>
        {lines.map((line, i) => {
          if (line.kind === 'render') {
            return (
              <div key={i} className="terminal-render">
                <WireframeModel accent="#5b7cff" accent2="#ffa62b" />
              </div>
            )
          }
          if (line.kind === 'neofetch') {
            return <Neofetch key={i} theme={theme} />
          }
          return (
            <div key={i} className={`term-line ${line.kind}`}>
              {line.kind === 'input' ? <span className="term-prompt">$</span> : null}
              <span>{line.text}</span>
            </div>
          )
        })}
        <div className="term-line input-row">
          <span className="term-prompt">$</span>
          <span className="term-input-display">
            {input}
            <span className="command-cursor" aria-hidden="true" />
          </span>
          <input
            ref={inputRef}
            className="term-input-hidden"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal command input"
          />
        </div>
      </div>
    </div>
  )
}

function App() {
  const reduceMotion = useReducedMotion()
  const [booted, setBooted] = useState(false)
  const [showBoot, setShowBoot] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(BOOT_SEEN_KEY) !== '1'
    } catch {
      return true
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [activeSection, setActiveSection] = useState('home')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [matrixActive, setMatrixActive] = useState(false)
  const scrollProgress = useScrollProgress()

  const finishBoot = useCallback(() => {
    setShowBoot(false)
    setBooted(true)
    try {
      window.sessionStorage.setItem(BOOT_SEEN_KEY, '1')
    } catch {
      // sessionStorage unavailable; boot just replays next time
    }
  }, [])

  useEffect(() => {
    if (!showBoot || reduceMotion) {
      const id = requestAnimationFrame(() => setBooted(true))
      return () => cancelAnimationFrame(id)
    }
  }, [showBoot, reduceMotion])

  useEffect(() => {
    console.log(
      '%cHey, nice of you to check the console.',
      'color:#5b7cff;font-size:15px;font-weight:bold;'
    )
    console.log(
      '%cLooking for someone who ships → github.com/ApparentlyTejas',
      'color:#ffa62b;font-size:12px;'
    )
    console.log('%cPsst: try the Konami code.', 'color:#9ba3b2;font-size:11px;')
  }, [])

  useKonamiCode(useCallback(() => setMatrixActive(true), []))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      window.localStorage.setItem('theme', theme)
    } catch {
      // localStorage unavailable; theme just won't persist
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'light' ? '#f7f8fb' : '#05070a')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const jumpTo = (id: string) => () => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const commands: Command[] = useMemo(
    () => [
      ...NAV_LINKS.map((l) => ({
        id: `goto-${l.href}`,
        label: `Go to ${l.label}`,
        hint: 'nav',
        run: jumpTo(l.href.slice(1)),
      })),
      {
        id: 'toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        hint: 'theme',
        run: toggleTheme,
      },
      {
        id: 'open-github',
        label: 'Open GitHub profile',
        hint: '↗',
        run: () => window.open('https://github.com/ApparentlyTejas', '_blank', 'noreferrer'),
      },
      {
        id: 'open-linkedin',
        label: 'Open LinkedIn profile',
        hint: '↗',
        run: () => window.open('https://www.linkedin.com/in/tejasmalhotra410850207', '_blank', 'noreferrer'),
      },
      {
        id: 'copy-email',
        label: 'Copy email address',
        hint: 'clipboard',
        run: () => {
          navigator.clipboard?.writeText('tejas.malhotra.14@gmail.com')
        },
      },
      {
        id: 'open-resume',
        label: 'Open résumé',
        hint: 'pdf',
        run: () => window.open(`${import.meta.env.BASE_URL}resume.pdf?v=2`, '_blank', 'noreferrer'),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  )

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {showBoot && !reduceMotion && <BootSequence key="boot" onComplete={finishBoot} />}
      </AnimatePresence>

      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />

      <AnimatePresence>
        {paletteOpen && (
          <CommandPalette key="palette" commands={commands} onClose={() => setPaletteOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {matrixActive && <MatrixRain key="matrix" onDone={() => setMatrixActive(false)} />}
      </AnimatePresence>

      <div className="aurora" aria-hidden="true">
        <span className="aurora-blob aurora-blue" />
        <span className="aurora-blob aurora-gold" />
        <span className="aurora-blob aurora-blue-2" />
      </div>
      <div className="scanlines" aria-hidden="true" />

      <div className="page-content">
      <header className="navbar">
        <a href="#home" className="brand" data-text="tejas malhotra">tejas malhotra</a>
        <nav className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={activeSection === l.href.slice(1) ? 'active' : ''}>
              {l.label}
              {activeSection === l.href.slice(1) && (
                <motion.span
                  className="nav-underline"
                  layoutId="nav-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </a>
          ))}
        </nav>
        <button className="palette-hint-btn" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
          <span>⌘</span>K
        </button>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <button
          className={`menu-btn ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <nav className="nav-mobile">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={activeSection === l.href.slice(1) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}

      <section id="home" className="hero-section">
        <div className="hero">
          <motion.span
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            $ whoami
          </motion.span>

          <h1 className="hero-title" aria-label="tejas_malhotra">
            {'tejas_malhotra'.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="char"
                initial={{ opacity: 0, y: 28, rotateX: -40 }}
                animate={booted ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.022, ease: EASE }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
            <span className="command-cursor hero-cursor" aria-hidden="true" />
          </h1>

          <motion.span
            className="badge"
            initial={{ opacity: 0, y: 10 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <span className="dot" /> M.Sc. ICT @ FAU Erlangen &middot; Open to internships
          </motion.span>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
          >
            I build across the stack: backend APIs, distributed systems, full-stack apps,
            and MCP tooling that lets AI agents act on real systems. I lean toward projects
            that get tested against real conditions, not just demoed once and shipped.
          </motion.p>

          <motion.div
            className="tag-row"
            initial={{ opacity: 0, y: 14 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
          >
            <span className="tag">Distributed Systems</span>
            <span className="tag">Backend Engineering</span>
            <span className="tag">AI &amp; MCP Tooling</span>
          </motion.div>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.25, ease: EASE }}
          >
            <MagneticLink href="#projects" className="btn btn-primary">View Projects</MagneticLink>
            <MagneticLink href="#contact" className="btn btn-ghost">Get in Touch</MagneticLink>
            <MagneticLink href={`${import.meta.env.BASE_URL}resume.pdf?v=2`} className="btn btn-ghost">Resume</MagneticLink>
          </motion.div>
        </div>
      </section>

      <Section id="render">
        <CommandHeader>$ ssh tejas@portfolio</CommandHeader>
        <Reveal className="wireframe-wrap">
          <InteractiveTerminal
            theme={theme}
            onGoto={(id) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}
            onThemeChange={setTheme}
            onMatrix={() => setMatrixActive(true)}
          />
        </Reveal>
      </Section>

      <Section id="about">
        <CommandHeader>$ about --me</CommandHeader>
        <Reveal className="about-grid">
          <p>
            Most of what's below started as a question I wanted answered for real: does this
            lock actually stop two people booking the same room, does this query still hold up
            against a billion rows, does this review tool survive past a single demo. I'd
            rather spend the extra time proving an answer than assume one.
          </p>
          <ul className="about-list">
            <li>
              I test things by actually breaking them: race conditions under real concurrent load,
              clean-checkout runs, chasing down query-planner behavior instead of trusting the
              first benchmark number.
            </li>
            <li>
              Backend: FastAPI/Flask APIs, PostgreSQL. AI: LLM-powered features, Anthropic/OpenAI
              SDKs. MCP: building servers and tools that let models act on real systems. Full-stack:
              React + TypeScript. Infra: Docker, AWS (EKS, multi-tier deployments). Also comfortable
              in C++.
            </li>
            <li>
              Software engineering student at Friedrich-Alexander-Universit&auml;t
              Erlangen-N&uuml;rnberg, currently exploring internship / working student
              opportunities.
            </li>
          </ul>
        </Reveal>
      </Section>

      <Section id="skills">
        <CommandHeader>$ skills --stack</CommandHeader>
        <StaggerGrid className="skills-grid">
          {SKILLS.map((s, i) => (
            <motion.div className="skill-card" key={s.label} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}>
              <div className="skill-card-head">
                <span><span className="card-index">{String(i + 1).padStart(2, '0')}</span> {s.label}</span>
                <span className="skill-count">{s.count}</span>
              </div>
              <ul>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </StaggerGrid>
      </Section>

      <Section id="projects">
        <CommandHeader>$ projects --selected</CommandHeader>
        <StaggerGrid className="projects-grid">
          {PROJECTS.map((p, i) => (
            <motion.div className="project-card" key={p.title} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}>
              <div className="project-head">
                <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="project-category">{p.category}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <ul className="project-bullets">
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="tag-row">
                {p.tags.map((t) => (
                  <span className="tag tag-sm" key={t}>{t}</span>
                ))}
              </div>
              <div className="project-links">
                <a href={p.github} target="_blank" rel="noreferrer">GitHub &rarr;</a>
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noreferrer">Live Demo &rarr;</a>
                )}
              </div>
            </motion.div>
          ))}
        </StaggerGrid>
      </Section>

      <Section id="experience">
        <CommandHeader>$ experience --all</CommandHeader>
        <StaggerGrid className="timeline">
          {EXPERIENCE.map((e) => (
            <motion.div className="timeline-card" key={e.role + e.company} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}>
              <div className="timeline-head">
                <div>
                  <h3>{e.role}</h3>
                  <p className="timeline-sub">{e.company} &middot; {e.location}</p>
                </div>
                <span className="timeline-dates">{e.dates}</span>
              </div>
              <ul>
                {e.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="tag-row">
                {e.tags.map((t) => (
                  <span className="tag tag-sm" key={t}>{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </StaggerGrid>
      </Section>

      <Section id="education">
        <CommandHeader>$ education --history</CommandHeader>
        <StaggerGrid className="timeline">
          {EDUCATION.map((e) => (
            <motion.div className="timeline-card" key={e.degree} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2, ease: EASE } }}>
              <div className="timeline-head">
                <div>
                  <h3>{e.degree}</h3>
                  <p className="timeline-sub">{e.school} &middot; {e.location}</p>
                </div>
                <span className="timeline-dates">{e.dates}</span>
              </div>
              <ul>
                {e.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </StaggerGrid>
      </Section>

      <Section id="contact">
        <CommandHeader>$ contact --open</CommandHeader>
        <Reveal className="contact-box">
          <h3>Let's build something real.</h3>
          <p>
            Open to internship and working student roles in backend, distributed systems,
            and AI engineering. Based in Erlangen, Germany &mdash; open to remote and relocation.
          </p>
          <div className="info-cards">
            <div className="info-card"><span>Status</span>Open to internships</div>
            <div className="info-card"><span>Location</span>Erlangen, Germany</div>
            <div className="info-card"><span>Languages</span>English (C2), German (A2, actively studying)</div>
          </div>
          <div className="contact-links">
            <a href="mailto:tejas.malhotra.14@gmail.com">Email</a>
            <a href="https://github.com/ApparentlyTejas" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/tejasmalhotra410850207" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </Reveal>
      </Section>

      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} Tejas Malhotra. All rights reserved.</span>
        <div className="footer-links">
          <a href="https://github.com/ApparentlyTejas" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/tejasmalhotra410850207" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </footer>
      </div>
    </MotionConfig>
  )
}

export default App
