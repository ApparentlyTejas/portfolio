import { useRef, type MouseEvent, type ReactNode } from 'react'

export default function MagneticButton({
  href,
  className = '',
  target,
  rel,
  children,
}: {
  href: string
  className?: string
  target?: string
  rel?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  function handleMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - (rect.left + rect.width / 2)
    const my = e.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${mx * 0.22}px, ${my * 0.32}px)`
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0, 0)'
  }

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={`magnetic ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </a>
  )
}
