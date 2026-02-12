"use client"

import Link from "next/link"
import { useRef, useEffect, useCallback, useState } from "react"

const themes = {
  dark: {
    bg: "bg-gray-900",
    grid: "bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)]",
    glow: "radial-gradient(circle, rgba(139,92,246,0.15), rgba(20,184,166,0.08), transparent 70%)",
    orbA: "bg-violet-600/10",
    orbB: "bg-teal-500/8",
    badge: "border-teal-500/20 bg-teal-500/10 text-teal-300",
    ping: "bg-teal-400",
    heading: "text-white",
    fadeOverlay: "text-white",
    subtitle: "text-gray-400",
    primaryBtn: "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/25 hover:shadow-violet-500/40",
    secondaryBtn: "border-gray-700 bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:border-gray-500 hover:text-white",
    gradientFrom: "from-violet-400",
    gradientVia: "via-teal-400",
    gradientTo: "to-violet-400",
  },
  light: {
    bg: "bg-linear-to-b from-white via-violet-50/30 to-teal-50/30",
    grid: "bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)]",
    glow: "radial-gradient(circle, rgba(139,92,246,0.12), rgba(20,184,166,0.06), transparent 70%)",
    orbA: "bg-violet-400/8",
    orbB: "bg-teal-400/6",
    badge: "border-teal-600/20 bg-teal-500/10 text-teal-600",
    ping: "bg-teal-500",
    heading: "text-gray-900",
    fadeOverlay: "text-gray-900",
    subtitle: "text-gray-600",
    primaryBtn: "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200 hover:shadow-violet-300/60",
    secondaryBtn: "border-2 border-teal-400 text-teal-600 hover:bg-teal-50",
    gradientFrom: "from-violet-600",
    gradientVia: "via-teal-500",
    gradientTo: "to-violet-600",
  },
}

export default function Hero() {
  const [variant, setVariant] = useState<"dark" | "light">("dark")
  const t = themes[variant]
  const sectionRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const mouseTarget = useRef({ x: 50, y: 50 })
  const glowPos = useRef({ x: 50, y: 50 })
  const rafId = useRef<number>(0)

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
      {/* Grid pattern */}
      <div className={`absolute inset-0 ${t.grid} bg-size-[64px_64px]`} />

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
          AI-powered career guidance with{" "}
          <span className="relative inline-block">
            <span
              className={`bg-linear-to-r ${t.gradientFrom} ${t.gradientVia} ${t.gradientTo} bg-clip-text text-transparent bg-size-[200%_200%]`}
              style={{ animation: "gradient-shift 4s ease-in-out infinite" }}
            >
              Launchpad
            </span>
            <span
              className={`absolute inset-0 ${t.fadeOverlay} pointer-events-none`}
              style={{ animation: "fade-out 1.2s ease-out 0.6s forwards" }}
            >
              Launchpad
            </span>
          </span>
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
