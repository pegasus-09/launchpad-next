"use client";

import LogoutButton from "@/components/auth/LogoutButton"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"

export default function WelcomeHeader() {
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setEmail(data.user?.email ?? null)
        })
    }, [])

    const name =
        email?.split("@")[0]
            ? email.split("@")[0][0].toUpperCase() + email.split("@")[0].slice(1)
            : "there"

    return (
        <section className="mb-2 flex items-center justify-between px-10 py-10">
        <div>
            <h1 className="text-3xl font-bold">
                Welcome back, <span className="text-violet-500">{name}</span>
            </h1>
            <p className="mt-2 text-gray-600">
                Here's a snapshot of your progress so far.
            </p>
        </div>
        <LogoutButton />
        </section>
    )
}
