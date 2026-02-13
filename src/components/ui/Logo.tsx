interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "light" | "dark"
  className?: string
}

/**
 * Launchpad Wordmark
 *
 * Abstract trajectory icon + wordmark. Arrow launching off a teal
 * pad with an AI spark in the corner.
 */
export default function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const config = {
    sm:  { text: "text-lg",  icon: 24, gap: "gap-1.5" },
    md:  { text: "text-xl",  icon: 28, gap: "gap-2" },
    lg:  { text: "text-2xl", icon: 32, gap: "gap-2.5" },
  }

  const palette = {
    light: {
      primary:    "#7c3aed",   // violet-600
      secondary:  "#14b8a6",   // teal-500
      accent:     "#a78bfa",   // violet-400
    },
    dark: {
      primary:    "#a78bfa",   // violet-400
      secondary:  "#2dd4bf",   // teal-400
      accent:     "#c4b5fd",   // violet-300
    },
  }

  const c = palette[variant]
  const s = config[size]

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`lp-grad-${variant}`} x1="0" y1="32" x2="32" y2="0">
            <stop offset="0%" stopColor={c.secondary} />
            <stop offset="100%" stopColor={c.primary} />
          </linearGradient>
        </defs>

        {/* Base pad — solid teal */}
        <rect
          x="4" y="20" width="24" height="3" rx="2.5"
          fill={c.secondary}
          opacity="0.55"
        />

        {/* Trajectory path */}
        <path
          d="M16 24 L16 10"
          stroke={`url(#lp-grad-${variant})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Arrow head */}
        <path
          d="M10.5 15 L16 7 L21.5 15"
          stroke={`url(#lp-grad-${variant})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* AI spark */}
        <path
          d="M25 6 L25.8 8.2 L28 9 L25.8 9.8 L25 12 L24.2 9.8 L22 9 L24.2 8.2 Z"
          fill={c.accent}
        />
      </svg>

      {/* Wordmark */}
      <span className={`font-bold tracking-tight ${s.text}`} style={{ letterSpacing: "-0.03em" }}>
        <span style={{ color: c.primary }}>launch</span>
        <span style={{ color: c.secondary }}>pad</span>
      </span>
    </span>
  )
}
