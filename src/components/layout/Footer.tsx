import Logo from "@/components/ui/Logo"

export default function Footer() {
  return (
    <footer className="py-4 flex flex-col items-center bg-gray-800">
      <Logo size="sm" variant="dark" />
      <p className="mt-1 text-xs text-gray-500">
        Career guidance for the next generation
      </p>
    </footer>
  )
}
