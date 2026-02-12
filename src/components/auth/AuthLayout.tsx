import ExitButton from "./ExitButton"

type Props = {
  children: React.ReactNode
  side: "left" | "right"
  bgColor: string
}

function FloatingOrbs() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Large orb */}
      <div
        className="absolute h-32 w-32 rounded-full bg-white/20 blur-sm"
        style={{ animation: "float-slow 8s ease-in-out infinite", top: "-40px", left: "-30px" }}
      />
      {/* Medium orb */}
      <div
        className="absolute h-20 w-20 rounded-full bg-white/15 blur-[2px]"
        style={{ animation: "float-medium 10s ease-in-out infinite", bottom: "-20px", right: "-20px" }}
      />
      {/* Small orb */}
      <div
        className="absolute h-14 w-14 rounded-full bg-white/10 blur-[1px]"
        style={{ animation: "float-fast 6s ease-in-out infinite", top: "20px", right: "-40px" }}
      />
      {/* Tiny dot accents */}
      <div
        className="absolute h-2 w-2 rounded-full bg-white/30"
        style={{ animation: "pulse-soft 3s ease-in-out infinite", top: "-20px", right: "10px" }}
      />
      <div
        className="absolute h-1.5 w-1.5 rounded-full bg-white/25"
        style={{ animation: "pulse-soft 4s ease-in-out infinite 1s", bottom: "-10px", left: "10px" }}
      />
      {/* Logo text */}
      <div className="relative text-3xl font-mono font-bold text-white select-none">
        <span>launch</span>
        <span>pad</span>
      </div>
    </div>
  )
}

export default function AuthLayout({ children, side, bgColor }: Props) {
  return (
    <div className={`relative min-h-screen grid grid-cols-1 ${side === "left" ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]"}`}>
      <ExitButton side={side} />
      {side === "left" && (
        <div className={`hidden md:flex items-center justify-center ${bgColor}`}>
          <FloatingOrbs />
        </div>
      )}

      <div className="flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {side === "right" && (
        <div className={`hidden md:flex items-center justify-center ${bgColor}`}>
          <FloatingOrbs />
        </div>
      )}
    </div>
  )
}
