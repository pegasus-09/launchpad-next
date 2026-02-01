"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Rankings from "@/components/dashboard/sections/Rankings"
import { loadPortfolio, generatePortfolio } from "@/lib/portfolio"

import AtAGlance from "@/components/dashboard/sections/AtAGlance"
import NextSteps from "@/components/dashboard/sections/NextSteps"
import StrengthsAndGaps from "@/components/dashboard/sections/StrengthsAndGaps"
import RoadmapAndUniversities from "@/components/dashboard/sections/RoadmapAndUnis"
import Link from "next/link"

type RankingItem = [string, string, number]

export default function DashboardPage() {
    const [ranking, setRanking] = useState<RankingItem[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState<string>("")
    const [portfolio, setPortfolio] = useState<any>(null)
    const [assessmentSuggestions, setAssessmentSuggestions] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                setLoading(false)
                return
            }

            // Set user name from email
            setUserName(session.user.email?.split("@")[0] || "there")

            const { data, error } = await supabase
                .from("assessment_results")
                .select("ranking, raw_answers")
                .eq("user_id", session.user.id)
                .single()

            if (!error && data?.ranking) {
                setRanking(data.ranking as RankingItem[])

                // Generate assessment-based suggestions
                if (data.raw_answers) {
                    try {
                        const suggestions = await generatePortfolio(data.raw_answers)
                        setAssessmentSuggestions(suggestions)
                    } catch (e) {
                        console.error("Failed to generate suggestions:", e)
                    }
                }
            }

            // Load portfolio data for Next Steps tracking
            try {
                const portfolioData = await loadPortfolio(session.user.id)
                setPortfolio(portfolioData)
            } catch (e) {
                console.error("Failed to load portfolio:", e)
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
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-3">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-lg text-violet-100">
                        Your personalised career insights are ready. We've analysed your strengths,
                        interests, and values to create your unique career roadmap.
                    </p>
                </div>
            </div>

            {/* At a Glance */}
            <AtAGlance ranking={ranking} />

            {/* Strengths first - most important */}
            <StrengthsAndGaps assessmentSuggestions={assessmentSuggestions} />

            {/* Career Rankings */}
            <Rankings ranking={ranking} />

            {/* Next Steps */}
            <NextSteps portfolio={portfolio} />

            {/* Roadmap and Universities */}
            <RoadmapAndUniversities />
        </div>
    )
}

