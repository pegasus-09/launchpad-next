"use client"

import Link from "next/link"
import { useRef, useEffect, useCallback, useState } from "react"

const themes = {
  dark: {
    bg: "bg-gray-900",
    glow: "radial-gradient(circle, rgba(139,92,246,0.15), rgba(20,184,166,0.08), transparent 70%)",
    orbA: "bg-violet-600/10",
    orbB: "bg-teal-500/8",
    badge: "border-teal-500/20 bg-teal-500/10 text-teal-300",
    ping: "bg-teal-400",
    heading: "text-white",
    subtitle: "text-gray-400",
    primaryBtn: "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/25 hover:shadow-violet-500/40",
    secondaryBtn: "border-gray-700 bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:border-gray-500 hover:text-white",
    gradientFrom: "from-violet-400",
    gradientVia: "via-teal-400",
    gradientTo: "to-violet-400",
  },
  light: {
    bg: "bg-linear-to-b from-white via-violet-50/30 to-teal-50/30",
    glow: "radial-gradient(circle, rgba(139,92,246,0.12), rgba(20,184,166,0.06), transparent 70%)",
    orbA: "bg-violet-400/8",
    orbB: "bg-teal-400/6",
    badge: "border-teal-600/20 bg-teal-500/10 text-teal-600",
    ping: "bg-teal-500",
    heading: "text-gray-900",
    subtitle: "text-gray-600",
    primaryBtn: "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200 hover:shadow-violet-300/60",
    secondaryBtn: "border-2 border-teal-400 text-teal-600 hover:bg-teal-50",
    gradientFrom: "from-violet-600",
    gradientVia: "via-teal-500",
    gradientTo: "to-violet-600",
  },
}

const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%"
const targetWord = "Launchpad"


export default function Hero() {
  const [variant, setVariant] = useState<"dark" | "light">("dark")
  const t = themes[variant]
  const sectionRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const mouseTarget = useRef({ x: 50, y: 50 })
  const glowPos = useRef({ x: 50, y: 50 })
  const rafId = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayChars = useRef<string[]>(Array(targetWord.length).fill(" "))
  const [, setTick] = useState(0)

  const animate = useCallback(() => {
    const lerp = 0.07
    glowPos.current.x += (mouseTarget.current.x - glowPos.current.x) * lerp
    glowPos.current.y += (mouseTarget.current.y - glowPos.current.y) * lerp

    if (glowRef.current) {
      glowRef.current.style.left = `${glowPos.current.x}%`
      glowRef.current.style.top = `${glowPos.current.y}%`
    }

    rafId.current = requestAnimationFrame(animate)
  }, [])

  // Mouse glow + dark mode detection
  useEffect(() => {
    rafId.current = requestAnimationFrame(animate)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setVariant(mq.matches ? "dark" : "light")
    const onChange = (e: MediaQueryListEvent) => setVariant(e.matches ? "dark" : "light")
    mq.addEventListener("change", onChange)

    return () => {
      cancelAnimationFrame(rafId.current)
      mq.removeEventListener("change", onChange)
    }
  }, [animate])

  // Canvas grid
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    type Cell = { alpha: number; targetAlpha: number; timer: number; color: "violet" | "teal" }
    let cells: Cell[] = []
    let gridRafId: number
    const cellSize = 64

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
            color: Math.random() < 0.5 ? "violet" : "teal",
          })
        }
      }
    }

    const drawGrid = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const maxAlpha = isDark ? 0.08 : 0.04
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
          ctx.fillStyle = cell.color === "violet"
            ? `rgba(139,92,246,${cell.alpha})`
            : `rgba(20,184,166,${cell.alpha})`
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      })

      // Grid lines
      ctx.strokeStyle = isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.07)"
      ctx.lineWidth = 1
      for (let x = 0; x <= w; x += cellSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y <= h; y += cellSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      gridRafId = requestAnimationFrame(drawGrid)
    }

    initCells()
    gridRafId = requestAnimationFrame(drawGrid)

    const onResize = () => initCells()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(gridRafId)
      window.removeEventListener("resize", onResize)
    }
  }, [])


  // Scramble text — starts as gibberish, resolves to "Launchpad"
  useEffect(() => {
    let mounted = true
    const resolved = new Array(targetWord.length).fill(false)
    const timers: ReturnType<typeof setTimeout>[] = []

    let iv: ReturnType<typeof setInterval> | null = null
    const scrambling = new Array(targetWord.length).fill(false)

    // Start invisible — spaces produce no glyph so bg-clip-text shows nothing
    displayChars.current = Array(targetWord.length).fill(" ")

    const startDelay = setTimeout(() => {
      if (!mounted) return

      // Interval keeps all currently-scrambling chars flickering
      iv = setInterval(() => {
        if (!mounted) return
        for (let i = 0; i < targetWord.length; i++) {
          if (scrambling[i] && !resolved[i]) {
            displayChars.current[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          }
        }
        if (resolved.every(Boolean)) clearInterval(iv!)
        setTick(prev => prev + 1)
      }, 60)

      // Each char: start scrambling, then resolve 200ms later
      for (let i = 0; i < targetWord.length; i++) {
        const appearTimer = setTimeout(() => {
          if (!mounted) return
          scrambling[i] = true
          displayChars.current[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          setTick(prev => prev + 1)
        }, i * 80)
        timers.push(appearTimer)

        const resolveTimer = setTimeout(() => {
          if (!mounted) return
          resolved[i] = true
          displayChars.current[i] = targetWord[i]
          setTick(prev => prev + 1)
        }, i * 80 + 200)
        timers.push(resolveTimer)
      }
    }, 250)

    timers.push(startDelay)

    return () => {
      mounted = false
      if (iv) clearInterval(iv)
      timers.forEach(clearTimeout)
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    mouseTarget.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      onMouseMove={variant === "dark" ? handleMouseMove : undefined}
      className={`relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-16 ${t.bg}`}
    >
      {/* Canvas grid */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ background: "transparent" }} />

      {/* Light mode radial gradient overlay */}
      {variant === "light" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,0.08),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(20,184,166,0.08),transparent_55%)]" />
      )}

      {/* Mouse-trailing glow (dark mode only) */}
      {variant === "dark" && (
        <div
          ref={glowRef}
          className="absolute w-125 h-125 rounded-full pointer-events-none"
          style={{
            background: t.glow,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(60px)",
          }}
        />
      )}

      {/* Static gradient orbs */}
      <div className={`absolute top-0 left-1/4 w-125 h-125 rounded-full ${t.orbA} blur-[120px]`} />
      <div className={`absolute bottom-0 right-1/4 w-100 h-100 rounded-full ${t.orbB} blur-[100px]`} />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* AI Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium mb-8 ${t.badge}`}
            style={{ animation: "fade-in-up 0.6s ease-out both" }}
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${t.ping} opacity-75`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${t.ping}`} />
            </span>
            Powered by AI
          </div>

          <h1
            className={`text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] ${t.heading}`}
            style={{ animation: "fade-in-up 0.6s ease-out 0.1s both" }}
          >
            Intelligent career guidance with
            <br />
            <span
              className={`bg-linear-to-r ${t.gradientFrom} ${t.gradientVia} ${t.gradientTo} bg-clip-text text-transparent bg-size-[200%_200%]`}
              style={{ animation: "gradient-shift 4s ease-in-out infinite" }}
            >
              {displayChars.current.join("")}
            </span>
            <br />
          </h1>

          <p
            className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${t.subtitle}`}
            style={{ animation: "fade-in-up 0.6s ease-out 0.2s both" }}
          >
            Psychometric assessments and personalised career recommendations
            tailored to each student&apos;s strengths, interests, and values.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            style={{ animation: "fade-in-up 0.6s ease-out 0.3s both" }}
          >
            <Link
              href="/login"
              className={`group inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg ${t.primaryBtn}`}
            >
              Get started
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#features"
              className={`inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-300 ${t.secondaryBtn}`}
            >
              Learn more
            </Link>
          </div>
      </div>
    </section>
  )
}
