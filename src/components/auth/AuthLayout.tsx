import ExitButton from "./ExitButton"

type Props = {
  children: React.ReactNode
  side: "left" | "right"
  bgColor: string
}

export default function AuthLayout({ children, side, bgColor }: Props) {
  return (
    <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-2">
      <ExitButton side={side} />
      {side === "left" && (
        <div className={`hidden md:flex items-center justify-center ${bgColor}`}>
          <div className="h-40 w-40 rounded-[40%] bg-white" />
        </div>
      )}

      <div className="flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {side === "right" && (
        <div className={`hidden md:flex items-center justify-center ${bgColor}`}>
          <div className="h-40 w-40 rounded-[40%] bg-white" />
        </div>
      )}
    </div>
  )
}
