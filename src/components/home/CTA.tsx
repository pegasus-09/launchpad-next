"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)

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
