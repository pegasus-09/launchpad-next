"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const showBackButton = pathname !== "/" && pathname !== "/dashboard"

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="w-full border-b border-gray-200 bg-gray-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo with back button */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-300 text-sm flex items-center gap-1"
            >
              <span className="text-lg">←</span> Back
            </button>
          )}
          <Link href="/" className="text-lg font-bold font-mono">
            launchpad
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/assessment" className="text-white hover:text-gray-300">
            Quiz
          </Link>
          <a href="#features" className="text-white hover:text-gray-300">
            About
          </a>
          <a href="#how-it-works" className="text-white hover:text-gray-300">
            How It Works
          </a>

          {/* Auth actions */}
          {!loading && (
            <div className="ml-4 flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-300">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-800"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-800"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-violet-500 px-4 py-2 text-sm text-white hover:bg-violet-600"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
