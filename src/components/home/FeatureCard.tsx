"use client"

import { useRef, useEffect, useState } from "react"

type Props = {
  icon: React.ReactNode
  title: string
  description: string
  index?: number
}

export default function FeatureCard({ icon, title, description, index = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -y * 10, y: x * 10 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      className={`rounded-2xl bg-white p-8 border transition-all duration-300
        ${hovered ? 'border-violet-300 shadow-lg shadow-violet-100/60' : 'border-gray-200'}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(0)`
          : 'translateY(28px)',
        transition: hovered
          ? `opacity 0.6s ease ${index * 0.15}s, transform 0.1s ease`
          : `opacity 0.6s ease ${index * 0.15}s, transform 0.5s ease`,
      }}
    >
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-teal-100 transition-transform duration-300 ${hovered ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  )
}
