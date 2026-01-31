"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
    loadPortfolio,
    savePortfolio,
    loadAssessmentResults,
    generatePortfolio,
} from "@/lib/portfolio"

import ProjectsSection from "@/components/portfolio/ProjectsSection"
import StrengthsSection from "@/components/portfolio/StrengthsSection"
import GapsSection from "@/components/portfolio/GapsSection"
import PortfolioReflectionSection from "@/components/portfolio/PortfolioReflectionSection"

export default function PortfolioPage() {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [portfolio, setPortfolio] = useState<any>(null)
    const [assessmentAnswers, setAssessmentAnswers] =
        useState<Record<string, number> | null>(null)

    const [assessmentSuggestions, setAssessmentSuggestions] =
        useState<{ strengths: any[]; gaps: any[] } | null>(null)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                router.push("/login")
                return
            }

            try {
                const existingPortfolio = await loadPortfolio(session.user.id)
                const assessment = await loadAssessmentResults(session.user.id)

                if (!assessment || !assessment.raw_answers) {
                    throw new Error(
                        "No assessment data exists. Please complete the assessment first."
                    )
                }

                const suggestions = await generatePortfolio(
                    assessment.raw_answers
                )

                // Initialize portfolio if it doesn't exist
                setPortfolio(existingPortfolio || {
                    strengths: [],
                    gaps: [],
                    projects: [],
                    bio: null
                })
                setAssessmentAnswers(assessment.raw_answers)
                setAssessmentSuggestions(suggestions)
            } catch (e: any) {
                console.error('Portfolio initialization error:', e) // Add logging
                setError(e.message ?? "Failed to load portfolio")
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [router])

    async function handleSave() {
        setSaving(true)
        setSaved(false)
        setError(null)

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            setError("Not authenticated")
            setSaving(false)
            return
        }

        try {
            await savePortfolio({
                user_id: session.user.id,
                strengths: portfolio.strengths ?? [],
                gaps: portfolio.gaps ?? [],
                projects: portfolio.projects ?? [],
                bio: portfolio.bio ?? null,
            })

            setSaved(true)
        } catch (e: any) {
            setError(e.message ?? "Failed to save portfolio")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading portfolio…
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-sm text-red-500">
                {error}
            </div>
        )
    }

    if (!portfolio) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading portfolio…
            </div>
        )
    }

    const selectedAssessmentStrengths = new Set<string>(
        (portfolio.strengths ?? [])
            .filter((s: any) => s.source === "assessment")
            .map((s: any) => s.signal as string)
    )

    const selectedAssessmentGaps = new Set<string>(
        (portfolio.gaps ?? [])
            .filter((g: any) => g.source === "assessment")
            .map((g: any) => g.signal as string)
    )

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    My Portfolio
                </h1>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                    {saving ? "Saving…" : "Save / Update"}
                </button>
            </div>

            {saved && (
                <p className="text-sm text-green-600">
                    Portfolio saved successfully.
                </p>
            )}

            <ProjectsSection
                projects={portfolio.projects ?? []}
                onChange={(projects) =>
                    setPortfolio({
                        ...portfolio,
                        projects,
                    })
                }
            />

            <StrengthsSection
                strengths={portfolio.strengths ?? []}
                suggestedStrengths={
                    assessmentSuggestions?.strengths ?? []
                }
                selectedAssessmentStrengths={
                    selectedAssessmentStrengths
                }
                onChange={(strengths) =>
                    setPortfolio({
                        ...portfolio,
                        strengths,
                    })
                }
            />

            <GapsSection
                gaps={portfolio.gaps ?? []}
                suggestedGaps={
                    assessmentSuggestions?.gaps ?? []
                }
                selectedAssessmentGaps={
                    selectedAssessmentGaps
                }
                onChange={(gaps) =>
                    setPortfolio({
                        ...portfolio,
                        gaps,
                    })
                }
            />

            <PortfolioReflectionSection
                summary={portfolio.bio ?? ""}
                onChange={(summary) =>
                    setPortfolio({
                        ...portfolio,
                        bio: summary,
                    })
                }
            />
        </div>
    )
}
