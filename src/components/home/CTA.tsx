"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)

  // Canvas grid effect (white-tinted cells, max alpha 0.04)
  useEffect(() => {
    const canvas = gridCanvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    type Cell = { alpha: number; targetAlpha: number; timer: number }
    let cells: Cell[] = []
    let rafId: number
    const cellSize = 64
    const maxAlpha = 0.04

    const initCells = () => {
      const w = section.offsetWidth
      const h = section.offsetHeight
      canvas.width = w
      canvas.height = h
      const cols = Math.ceil(w / cellSize)
      const rows = Math.ceil(h / cellSize)
      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            alpha: 0,
            targetAlpha: 0,
            timer: Math.floor(Math.random() * 190) + 60,
          })
        }
      }
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const w = canvas.width
      const h = canvas.height
      const cols = Math.ceil(w / cellSize)
      ctx.clearRect(0, 0, w, h)

      cells.forEach((cell, idx) => {
        cell.alpha += (cell.targetAlpha - cell.alpha) * 0.04
        cell.timer--
        if (cell.timer <= 0) {
          cell.targetAlpha = Math.random() < 0.5 ? 0 : Math.random() * maxAlpha
          cell.timer = Math.floor(Math.random() * 190) + 60
        }

        const col = idx % cols
        const row = Math.floor(idx / cols)
        const x = col * cellSize
        const y = row * cellSize

        if (cell.alpha > 0.001) {
          ctx.fillStyle = `rgba(255,255,255,${cell.alpha})`
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      })

      rafId = requestAnimationFrame(draw)
    }

    initCells()
    rafId = requestAnimationFrame(draw)

    const onResize = () => initCells()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", onResize)
    }
  }, [])


  // Particle network
  useEffect(() => {
    const canvas = particleCanvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    type Particle = { x: number; y: number; vx: number; vy: number; bvx: number; bvy: number; alpha: number; angle: number; angleSpeed: number; speed: number }
    let particles: Particle[] = []
    let particleRafId: number
    const mouse = { x: -9999, y: -9999 }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    section.addEventListener("mousemove", onMouseMove)
    section.addEventListener("mouseleave", onMouseLeave)

    const initParticles = () => {
      const w = section.offsetWidth || window.innerWidth
      const h = section.offsetHeight || window.innerHeight
      canvas.width = w
      canvas.height = h
      particles = Array.from({ length: 40 }, () => {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.18 + Math.random() * 0.18
        const bvx = Math.cos(angle) * speed
        const bvy = Math.sin(angle) * speed
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: bvx, vy: bvy, bvx, bvy,
          alpha: 0.18 + Math.random() * 0.15,
          angle,
          angleSpeed: (Math.random() - 0.5) * 0.012,
          speed,
        }
      })
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const repelRadius = 80
      const repelStrength = 0.8
      const maxSpeed = 2.5

      particles.forEach(p => {
        p.angle += p.angleSpeed
        p.bvx = Math.cos(p.angle) * p.speed
        p.bvy = Math.sin(p.angle) * p.speed

        const mdx = p.x - mouse.x
        const mdy = p.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < repelRadius && mdist > 0) {
          const force = (1 - mdist / repelRadius) * repelStrength
          p.vx += (mdx / mdist) * force
          p.vy += (mdy / mdist) * force
        }
        p.vx += (p.bvx - p.vx) * 0.045
        p.vy += (p.bvy - p.vy) * 0.045
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > maxSpeed) { p.vx = (p.vx / speed) * maxSpeed; p.vy = (p.vy / speed) * maxSpeed }

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.25
            ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
            ctx.lineWidth = 1.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        ctx.shadowBlur = 4
        ctx.shadowColor = "rgba(255,255,255,0.3)"
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        ctx.fill()
        ctx.shadowBlur = 0
      })

      particleRafId = requestAnimationFrame(draw)
    }

    initParticles()
    particleRafId = requestAnimationFrame(draw)

    const onResize = () => initParticles()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(particleRafId)
      window.removeEventListener("resize", onResize)
      section.removeEventListener("mousemove", onMouseMove)
      section.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-linear-to-br from-violet-600 via-violet-700 to-teal-600 py-24 text-center text-white"
    >
      {/* Existing CSS grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

      {/* Animated canvas grid */}
      <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Particle network */}
      <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* CSS orbs */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-white/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-white/[0.08] blur-[80px] rounded-full pointer-events-none" />


<div className="relative">
        <h2
          className="text-4xl md:text-5xl font-bold"
          style={{ animation: "fade-in-up 0.6s ease-out both" }}
        >
          Equip your students for the future
        </h2>
        <p
          className="mt-4 text-lg text-violet-100 max-w-2xl mx-auto"
          style={{ animation: "fade-in-up 0.6s ease-out 0.15s both" }}
        >
          Data-driven career guidance tailored to each student&apos;s strengths and aspirations
        </p>

        <div
          className="mt-10 flex justify-center gap-4"
          style={{ animation: "fade-in-up 0.6s ease-out 0.3s both" }}
        >
          <Link
            href="/login"
            className="group inline-flex items-center rounded-xl bg-white px-8 py-3.5 text-lg font-semibold text-violet-600 transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
          >
            Get Started
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
