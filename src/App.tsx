import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Scene3D from './Scene3D'
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
  return <h2 className="command-header">{children}</h2>
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

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
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

function App() {
  const [booted, setBooted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [activeSection, setActiveSection] = useState('home')
  useEffect(() => {
    const id = requestAnimationFrame(() => setBooted(true))
    return () => cancelAnimationFrame(id)
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
    window.localStorage.setItem('theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'light' ? '#f7f8fb' : '#05070a')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <>
      <Scene3D theme={theme} />

      <div className="page-content">
      <header className="navbar">
        <a href="#home" className="brand">tejas malhotra</a>
        <nav className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={activeSection === l.href.slice(1) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
        </nav>
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
        <div className="hero-fade" />
        <div className="hero">
          <motion.span
            className="badge"
            initial={{ opacity: 0, y: 10 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="dot" /> M.Sc. ICT @ FAU Erlangen &middot; Open to internships
          </motion.span>

          <h1 className="hero-title" aria-label="Hi, I'm Tejas">
            {'Hi, I’m Tejas'.split('').map((ch, i) => (
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
          </h1>

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
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-ghost">Get in Touch</a>
            <a href={`${import.meta.env.BASE_URL}resume.pdf?v=2`} className="btn btn-ghost">Resume</a>
          </motion.div>
        </div>
      </section>

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
        <Reveal className="skills-grid">
          {SKILLS.map((s) => (
            <div className="skill-card" key={s.label}>
              <div className="skill-card-head">
                <span>{s.label}</span>
                <span className="skill-count">{s.count}</span>
              </div>
              <ul>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </Section>

      <Section id="projects">
        <CommandHeader>$ projects --selected</CommandHeader>
        <Reveal className="projects-grid">
          {PROJECTS.map((p) => (
            <div className="project-card" key={p.title}>
              <div className="project-head">
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
            </div>
          ))}
        </Reveal>
      </Section>

      <Section id="experience">
        <CommandHeader>$ experience --all</CommandHeader>
        <Reveal className="timeline">
          {EXPERIENCE.map((e) => (
            <div className="timeline-card" key={e.role + e.company}>
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
            </div>
          ))}
        </Reveal>
      </Section>

      <Section id="education">
        <CommandHeader>$ education --history</CommandHeader>
        <Reveal className="timeline">
          {EDUCATION.map((e) => (
            <div className="timeline-card" key={e.degree}>
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
            </div>
          ))}
        </Reveal>
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
    </>
  )
}

export default App
