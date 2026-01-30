"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { generatePortfolio, loadPortfolio, savePortfolio } from "@/lib/portfolio"

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
                const existing = await loadPortfolio(session.user.id)

                if (existing) {
                    setPortfolio(existing)
                    console.log("Loaded existing portfolio:", existing)
                } else {
                    // Temporary seed until real assessment answers are stored
                    const fakeAnswers = {
                        A1: 4, A2: 5, A3: 4, A4: 3, A5: 4,
                        I1: 3, I2: 2, I3: 3, I4: 2, I5: 3, I6: 2,
                        T1: 4, T2: 3, T3: 4, T4: 3, T5: 4, T6: 3,
                        V1: 5, V2: 4, V3: 5, V4: 4, V5: 5, V6: 4,
                        W1: 3, W2: 2, W3: 3, W4: 2,
                    }

                    const generated = await generatePortfolio(fakeAnswers)
                    console.log("Generated portfolio:", generated.strengths)

                    setPortfolio({
                        ...generated,
                        strengths: generated.strengths ?? [],
                        gaps: generated.gaps ?? [],
                    })
                }
            } catch (e: any) {
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

    console.log(portfolio.strengths)

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
                        projects
                    })
                }
            />

            <StrengthsSection
                strengths={portfolio.strengths ?? []}
                onChange={(strengths) =>
                    setPortfolio({
                        ...portfolio,
                        strengths
                    })
                }
            />

            <GapsSection
                gaps={portfolio.gaps ?? []}
                onChange={(gaps) =>
                    setPortfolio({
                        ...portfolio,
                        gaps
                    })
                }
            />

            <PortfolioReflectionSection
                summary={portfolio.bio ?? ""}
                onChange={(summary) =>
                    setPortfolio({
                        ...portfolio,
                        bio: summary
                    })
                }
            />
        </div>
    )
}
