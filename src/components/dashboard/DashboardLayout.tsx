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
	console.log("DashboardLayout rendered");
	console.log(supabase.auth.getUser());

	useEffect(() => {
    	supabase.auth.getUser().then(({ data }) => {
			const user = data.user

			if (!user) {
				router.replace("/login")
				return
			}

			const onboardingComplete = user.user_metadata?.onboarding_complete === true

			if (!onboardingComplete) {
				router.replace("/onboarding")
			}
    	})
	}, [router])


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center border-b bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-black">Dashboard</h1>
        <LogoutButton />
      </header>

      <main className="px-6 py-8 space-y-5 text-black">
        {children}
      </main>
    </div>
  )
}
