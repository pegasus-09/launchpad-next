"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
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
        { id: 1, label: 'Dashboard', href: '/dashboard' },
        { id: 2, label: 'Profile', href: '/profile' },
        { id: 3, label: 'Portfolio', href: '/portfolio' }
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-black">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r bg-white px-4 py-6">
                <div className="flex flex-col">
                    <h2 className="mb-8 text-xl font-bold font-mono">
                        launchpad
                    </h2>

                    <nav className="space-y-2 text-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="block rounded px-3 py-2 hover:bg-gray-100"
                            >
                                {item.label}
                            </Link>
                        ))}
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
