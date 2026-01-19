import Link from "next/link"

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-gray-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="text-lg font-bold font-mono">
          launchpad
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <a href="#" className="text-white hover:text-gray-300">
            Quiz
          </a>
          <a href="#" className="text-white hover:text-gray-300">
            About
          </a>
          <a href="#" className="text-white hover:text-gray-300">
            Careers
          </a>

          {/* Auth actions */}
          <div className="ml-4 flex items-center gap-3">
            <Link href="/login" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-800">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-violet-500 px-4 py-2 text-sm text-white hover:bg-violet-600">
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
