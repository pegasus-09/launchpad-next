"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import LogoutButton from "@/components/auth/LogoutButton"
import Link from "next/link"

type Props = {
    children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const user = data.user

            if (!user) {
                router.replace("/login")
                return
            }

            const onboardingComplete =
                user.user_metadata?.onboarding_complete === true

            if (!onboardingComplete) {
                router.replace("/onboarding")
            }
        })
    }, [router])

    return (
        <div className="flex min-h-screen bg-gray-50 text-black">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r bg-white px-4 py-6">
                <div className="flex flex-col">
                    <h2 className="mb-8 text-xl font-bold">
                        Launchpad
                    </h2>

                    <nav className="space-y-2 text-sm">
                        <Link
                            href="/dashboard"
                            className="block rounded px-3 py-2 hover:bg-gray-100"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/dashboard/profile"
                            className="block rounded px-3 py-2 hover:bg-gray-100"
                        >
                            Profile
                        </Link>

                        <Link
                            href="/dashboard/results"
                            className="block rounded px-3 py-2 hover:bg-gray-100"
                        >
                            Results
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto pt-6">
                    <LogoutButton />
                </div>
            </aside>



            {/* Main content */}
            <main className="ml-64 flex-1 overflow-y-auto px-8 py-10">
                {children}
            </main>

        </div>
    )
}
