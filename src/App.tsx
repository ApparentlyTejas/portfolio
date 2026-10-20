import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import NetworkScene from './NetworkScene'
import TiltCard from './TiltCard'
import CursorGlow from './CursorGlow'
import MagneticButton from './MagneticButton'
import './App.css'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
]

const SKILLS = [
  {
    label: 'Backend & APIs',
    count: 6,
    items: ['Python', 'FastAPI', 'REST APIs', 'Pydantic', 'JWT Auth', 'MCP Servers'],
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
    count: 6,
    items: ['AWS (EC2, S3, RDS, VPC)', 'Docker', 'GitHub Actions', 'GitLab CI/CD', 'Git', 'Load Testing (Locust)'],
  },
  {
    label: 'Full-Stack',
    count: 4,
    items: ['React', 'TypeScript', 'Vite', 'HttpOnly-Cookie Auth'],
  },
]

const PROJECTS = [
  {
    id: '01',
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
    id: '02',
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
  },
  {
    id: '03',
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
    id: '04',
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

function App() {
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setBooted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <CursorGlow />
      <header className="navbar">
        <a href="#home" className="brand">tejas malhotra</a>
        <nav>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
      </header>

      <section id="home" className="hero-section">
        <div className="hero-canvas">
          <Suspense fallback={null}>
            <NetworkScene />
          </Suspense>
        </div>
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
            <MagneticButton href="#projects" className="btn btn-primary">View Projects</MagneticButton>
            <MagneticButton href="#contact" className="btn btn-ghost">Get in Touch</MagneticButton>
            <MagneticButton href={`${import.meta.env.BASE_URL}resume.pdf`} className="btn btn-ghost" target="_blank" rel="noreferrer">Resume</MagneticButton>
          </motion.div>
        </div>
      </section>

      <Section id="about">
        <CommandHeader>$ about --me</CommandHeader>
        <div className="about-grid">
          <p>
            I'm an M.Sc. student in Information and Communication Technology at
            Friedrich-Alexander-Universit&auml;t Erlangen-N&uuml;rnberg, focused on distributed systems
            and backend development, with a B.Tech in Electronics and Communication Engineering
            from Manipal University Jaipur.
          </p>
          <p>
            I test things by actually breaking them: race conditions under real concurrent load,
            clean-checkout runs, chasing down query-planner behavior instead of trusting the first
            benchmark number. Most of my projects start from a real failure mode I found, not a
            feature list.
          </p>
          <p>
            Lately that means backend APIs and distributed data systems, LLM-powered features with
            schema-validated structured output, and building MCP servers and tools that let models
            act on real systems rather than just talk about them.
          </p>
          <p>
            Currently exploring internship and working student opportunities in software engineering,
            based in Erlangen, Germany.
          </p>
        </div>
      </Section>

      <Section id="skills">
        <CommandHeader>$ skills --stack</CommandHeader>
        <div className="skills-grid">
          {SKILLS.map((s) => (
            <TiltCard className="skill-card" key={s.label}>
              <div className="skill-card-head">
                <span>{s.label}</span>
                <span className="skill-count">{s.count}</span>
              </div>
              <ul>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </Section>

      <Section id="projects">
        <CommandHeader>$ projects --selected</CommandHeader>
        <div className="projects-grid">
          {PROJECTS.map((p) => (
            <TiltCard className="project-card" key={p.id}>
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
            </TiltCard>
          ))}
        </div>
      </Section>

      <Section id="experience">
        <CommandHeader>$ experience --all</CommandHeader>
        <div className="timeline">
          {EXPERIENCE.map((e) => (
            <TiltCard className="timeline-card" key={e.role + e.company}>
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
            </TiltCard>
          ))}
        </div>
      </Section>

      <Section id="education">
        <CommandHeader>$ education --history</CommandHeader>
        <div className="timeline">
          {EDUCATION.map((e) => (
            <TiltCard className="timeline-card" key={e.degree}>
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
            </TiltCard>
          ))}
        </div>
      </Section>

      <Section id="contact">
        <CommandHeader>$ contact --open</CommandHeader>
        <div className="contact-box">
          <h3>Let's build something real.</h3>
          <p>
            Open to internship and working student roles in backend, distributed systems,
            and AI engineering. Based in Erlangen, Germany &mdash; open to remote and relocation.
          </p>
          <div className="info-cards">
            <div className="info-card"><span>Status</span>Open to internships</div>
            <div className="info-card"><span>Location</span>Erlangen, Germany</div>
            <div className="info-card"><span>Languages</span>English (C2), German (A2)</div>
          </div>
          <div className="contact-links">
            <a href="mailto:tejas.malhotra.14@gmail.com">Email</a>
            <a href="https://github.com/ApparentlyTejas" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/tejasmalhotra410850207" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </Section>

      <footer className="footer">
        <span>tejasmalhotra.dev</span>
        <span>built with React + Vite + TypeScript</span>
        <span>&copy; {new Date().getFullYear()} Tejas Malhotra</span>
      </footer>
    </>
  )
}

export default App
