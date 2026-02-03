"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return

    setLoading(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  )
}
