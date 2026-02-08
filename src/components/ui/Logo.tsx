interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "light" | "dark"
  className?: string
}

/**
 * Launchpad Logo Component
 *
 * Easy to update: Simply modify the content below to change the logo across all dashboards.
 * - For a text logo: Update the spans with your text and colors
 * - For an image logo: Replace the content with an <Image /> component
 *
 * Usage:
 *   <Logo />                    - Default medium size
 *   <Logo size="lg" />          - Large size
 *   <Logo variant="dark" />     - Dark background variant (brighter colors)
 */
export default function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  const colorClasses = {
    light: {
      primary: "text-violet-600",
      secondary: "text-teal-500",
    },
    dark: {
      primary: "text-violet-400",
      secondary: "text-teal-400",
    },
  }

  const colors = colorClasses[variant]

  return (
    <span className={`font-bold font-mono ${sizeClasses[size]} ${className}`}>
      <span className={colors.primary}>launch</span>
      <span className={colors.secondary}>pad</span>
    </span>
  )
}
