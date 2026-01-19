"use client";

import { ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LogoutButton from "../auth/LogoutButton";

type Props = {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login")
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center border-b bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <LogoutButton />
      </header>

      <main className="px-6 py-8">
        {children}
      </main>
    </div>
  )
}
