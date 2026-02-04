"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import LogoutButton from "@/components/auth/LogoutButton"
import Link from "next/link"

type Props = {
    children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
    const router = useRouter()
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient()
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                router.replace("/login")
                return
            }

            setAuthChecked(true)
        }

        checkAuth()
    }, [router])

    if (!authChecked) {
        return <div className="p-6">Loading…</div>
    }

    // Items for navigation - Update this when adding new dashboard sections
    type NavItem = {
        id: number
        label: string
        href: string
    }

    const navItems: NavItem[] = [
        { id: 1, label: 'Dashboard', href: '/student' },
        { id: 2, label: 'Assessmet', href: '/assessment' },
        // { id: 3, label: 'Portfolio', href: '/portfolio' }
    ];

    return (
        <div className="flex h-screen bg-gray-500 text-white">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r bg-gray-900 px-4 py-6">
                <div className="flex flex-col space-y-7.5">
                    <Link href="/student/" className="text-3xl font-bold font-mono">
                        <span className="text-violet-400">launch</span>
                        <span className="text-teal-400">pad</span>
                    </Link>

                    <nav className="space-y-2 text-md">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="block rounded px-3 py-2 hover:bg-gray-800"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto pt-6">
                    <LogoutButton variant="dark"/>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
