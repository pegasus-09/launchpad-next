"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
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
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="w-full border-b border-gray-800 bg-gray-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo with back button */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white text-sm flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="text-lg">←</span> Back
            </button>
          )}
          <Link href="/" className="text-lg font-bold font-mono">
            <span className="text-violet-400">launch</span>
            <span className="text-teal-400">pad</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">
            About
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
            How It Works
          </a>

          {/* Auth actions */}
          {!loading && (
            <div className="ml-4 flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-400">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:border-gray-500 cursor-pointer transition-all"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                href="/login"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                Log in
              </Link>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}