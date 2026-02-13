"use client"

import { ReactNode, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import LogoutButton from "@/components/auth/LogoutButton"
import Logo from "@/components/ui/Logo"
import Link from "next/link"

type Props = {
    children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [authChecked, setAuthChecked] = useState(false)
    const [studentName, setStudentName] = useState("")

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

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", session.user.id)
                .single()

            if (profile?.full_name) {
                setStudentName(profile.full_name)
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
        { id: 2, label: 'Assessment', href: '/student/assessment' },
        { id: 3, label: 'My Subjects', href: '/student/subjects' },
        { id: 4, label: 'Portfolio', href: '/student/portfolio' },
        { id: 5, label: 'Career Goals', href: '/student/careers' },
    ];

    return (
        <div className="flex h-screen bg-gray-500 text-white">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r bg-gray-800 px-4 py-6">
                <div className="flex flex-col space-y-7.5">
                    <div>
                        <Link href="/student/" className="inline-block">
                            <Logo size="lg" variant="dark" />
                        </Link>
                        {studentName && (
                            <div className="text-sm text-gray-400 mt-2 truncate">
                                {studentName}
                            </div>
                        )}
                    </div>

                    <nav className="space-y-1 text-md">
                        {navItems.map((item) => {
                            const isActive = item.href === '/student'
                                ? pathname === '/student'
                                : pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`block rounded-lg px-3 py-2 transition-colors ${
                                        isActive
                                            ? 'bg-violet-600 text-white font-medium'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
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
