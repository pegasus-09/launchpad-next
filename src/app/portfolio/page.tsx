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

                setPortfolio(
                    existingPortfolio || {
                        strengths: [],
                        gaps: [],
                        projects: [],
                        bio: null,
                    }
                )
                setAssessmentAnswers(assessment.raw_answers)
                setAssessmentSuggestions(suggestions)
            } catch (e: any) {
                console.error("Portfolio initialization error:", e)
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

    async function handleSaveAndExport() {
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

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/portfolio/export/pdf?user_id=${session.user.id}`
            )

            if (!res.ok) {
                throw new Error("Failed to export PDF")
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)

            const a = document.createElement("a")
            a.href = url
            a.download = "portfolio.pdf"
            document.body.appendChild(a)
            a.click()
            a.remove()

            window.URL.revokeObjectURL(url)

            setSaved(true)
        } catch (e: any) {
            setError(e.message ?? "Failed to save or export portfolio")
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
            <div className="mb-4">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold">
                    My Portfolio
                </h1>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-bold text-blue-900 mb-2">Portfolio Instructions</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Add 1 or more projects that showcase your skills and interests</li>
                        <li>Select strengths and gaps from the AI-generated suggestions based on your assessment</li>
                        <li>Write a brief bio that summarizes who you are and what you're passionate about</li>
                        <li>Click "Save & Export PDF" to download your portfolio for university applications or resumes</li>
                    </ul>
                </div>
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

            <div className="flex gap-2 justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                >
                    Save
                </button>

                <button
                    onClick={handleSaveAndExport}
                    disabled={saving}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                >
                    Save & Export PDF
                </button>
            </div>
        </div>
    )
}
