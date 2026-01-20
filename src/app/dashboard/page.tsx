"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Rankings from "@/components/dashboard/sections/Rankings"

import WelcomeHeader from "@/components/dashboard/sections/WelcomeHeader"
import AtAGlance from "@/components/dashboard/sections/AtAGlance"
import NextSteps from "@/components/dashboard/sections/NextSteps"
import StrengthsAndGaps from "@/components/dashboard/sections/StrengthsAndGaps"
import RoadmapAndColleges from "@/components/dashboard/sections/RoadmapAndUnis"

type RankingItem = [string, string, number]

export default function DashboardPage() {
    const [ranking, setRanking] = useState<RankingItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            if (error || !user) {
                setLoading(false)
                return
            }

            const metadata = user.user_metadata

            if (metadata?.latest_ranking) {
                setRanking(metadata.latest_ranking)
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
            <div className="p-6">
                <p>No assessment data found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-5 bg-white text-black">
            <WelcomeHeader />
            <AtAGlance />
            <Rankings ranking={ranking} />
            <NextSteps />
            <StrengthsAndGaps />
            <RoadmapAndColleges />
        </div>
    )
}
