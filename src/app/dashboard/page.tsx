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
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        async function load() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                setAuthChecked(true)
                return
            }

            const metadata = user.user_metadata

            if (metadata?.latest_ranking) {
                setRanking(metadata.latest_ranking)
            }

            setAuthChecked(true)
        }

        load()
    }, [])

    if (!authChecked) {
        return <p className="p-6">Loading…</p>
    }

    if (!ranking) {
        return (
            <div className="p-6">
                <p>No assessment results found.</p>
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
