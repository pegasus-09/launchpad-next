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
      className="cursor-pointer rounded-md border border-red-400 px-3 py-2 text-sm text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  )
}
