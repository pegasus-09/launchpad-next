"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LogoutButtonProps {
  variant?: "light" | "dark"
}

export default function LogoutButton({ variant = "light" }: LogoutButtonProps) {
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

  const lightStyles = "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
  const darkStyles = "bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 border-0"

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`cursor-pointer rounded-lg px-4 py-2 text-sm 
        disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium
        ${variant === "dark" ? darkStyles : "border " + lightStyles}
      `}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  )
}