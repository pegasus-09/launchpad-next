"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Rankings from "@/components/dashboard/sections/Rankings"

import WelcomeHeader from "@/components/dashboard/sections/WelcomeHeader"
import AtAGlance from "@/components/dashboard/sections/AtAGlance"
import NextSteps from "@/components/dashboard/sections/NextSteps"
import StrengthsAndGaps from "@/components/dashboard/sections/StrengthsAndGaps"
import RoadmapAndColleges from "@/components/dashboard/sections/RoadmapAndUnis"
import Link from "next/link"

type RankingItem = [string, string, number]

export default function DashboardPage() {
    const [ranking, setRanking] = useState<RankingItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from("assessment_results")
                .select("ranking")
                .eq("user_id", session.user.id)
                .single()

            if (!error && data?.ranking) {
                setRanking(data.ranking as RankingItem[])
            }

            setLoading(false)
        }

        load()
    }, [])

    if (loading) {
        return <p className="p-6">Loading…</p>
    }

    if (!ranking) {
        return (
            <div className="bg-gray-50 text-black flex flex-col items-center justify-center py-20">
                <p className="p-6">No assessment results found.</p>

                <Link
                    href="/assessment"
                    className="rounded-md cursor-pointer bg-violet-500 px-6 py-3.5 text-lg text-white hover:bg-violet-600"
                >
                    Start assessment
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-5 bg-gray-50 text-black">
            <WelcomeHeader />
            <AtAGlance />
            <Rankings ranking={ranking} />
            <NextSteps />
            <StrengthsAndGaps />
            <RoadmapAndColleges />
        </div>
    )
}
