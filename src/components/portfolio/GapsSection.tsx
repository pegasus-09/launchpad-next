"use client"

import { useState } from "react"

export type PortfolioSignal = {
    category?: string
    signal: string
    description?: string
    percentile?: number
    source: "assessment" | "user"
}

type SuggestedGap = {
    signal: string
    description?: string
    category?: string
    percentile?: number
}

type Props = {
    gaps: PortfolioSignal[]
    suggestedGaps: SuggestedGap[]
    selectedAssessmentGaps: Set<string>
    onChange: (gaps: PortfolioSignal[]) => void
}

export default function GapsSection({
    gaps,
    suggestedGaps,
    selectedAssessmentGaps,
    onChange,
}: Props) {
    const [newGap, setNewGap] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(true)

    function toggleSuggested(suggestion: SuggestedGap) {
        const exists = gaps.some(
            g =>
                g.signal === suggestion.signal &&
                g.source === "assessment"
        )

        if (exists) {
            onChange(
                gaps.filter(
                    g =>
                        !(
                            g.signal === suggestion.signal &&
                            g.source === "assessment"
                        )
                )
            )
        } else {
            onChange([
                ...gaps,
                {
                    signal: suggestion.signal,
                    description: suggestion.description,
                    category: suggestion.category,
                    percentile: suggestion.percentile,
                    source: "assessment",
                },
            ])
        }
    }

    function addAllSuggestions() {
        const newGaps = suggestedGaps
            .filter(g => !selectedAssessmentGaps.has(g.signal))
            .map(g => ({
                signal: g.signal,
                description: g.description,
                category: g.category,
                percentile: g.percentile,
                source: "assessment" as const,
            }))

        onChange([...gaps, ...newGaps])
    }

    function remove(index: number) {
        onChange(gaps.filter((_, i) => i !== index))
    }

    function add() {
        if (!newGap.trim()) return

        onChange([
            ...gaps,
            {
                signal: newGap.trim(),
                source: "user",
            },
        ])

        setNewGap("")
    }

    const unselectedSuggestions = suggestedGaps.filter(
        g => !selectedAssessmentGaps.has(g.signal)
    )

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-orange-900">Gaps</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Identify areas for improvement from suggestions or add your own
                </p>
            </div>

            {/* Suggestions - Moved to top */}
            {unselectedSuggestions.length > 0 && (
                <div className="space-y-3 bg-orange-50/50 border-2 border-dashed border-orange-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="flex items-center gap-2 text-sm font-medium text-orange-800 hover:text-orange-900 cursor-pointer"
                        >
                            <span>{showSuggestions ? "▼" : "▶"}</span>
                            <span>
                                Suggestions from assessment ({unselectedSuggestions.length})
                            </span>
                        </button>

                        {unselectedSuggestions.length > 0 && (
                            <button
                                onClick={addAllSuggestions}
                                className="text-xs font-medium text-orange-700 hover:text-orange-900 underline cursor-pointer"
                            >
                                Add all
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {unselectedSuggestions.map(g => (
                                <button
                                    key={g.signal}
                                    onClick={() => toggleSuggested(g)}
                                    className="text-left p-3 rounded-lg border border-orange-300 bg-white hover:border-orange-600 hover:bg-orange-50 transition-all text-sm capitalize cursor-pointer"
                                >
                                    + {g.signal === "work_life_balance" 
                                        ? "Work-Life Balance" 
                                        : g.signal.replaceAll("_", " ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Gaps */}
            {gaps.length > 0 && (
                <div className="space-y-2">
                    {gaps.map((g, i) => (
                        <div
                            key={`${g.signal}-${i}`}
                            className="flex items-center justify-between gap-4 p-3 rounded-lg border border-orange-200 bg-orange-50"
                        >
                            <span className="font-medium capitalize text-orange-900">
                                {g.signal === "work_life_balance" 
                                    ? "Work-Life Balance" 
                                    : g.signal.replaceAll("_", " ")}
                            </span>

                            <button
                                onClick={() => {
                                    if (g.source === "user") {
                                        remove(i)
                                    } else {
                                        const suggestion = suggestedGaps.find(
                                            sg => sg.signal === g.signal
                                        )
                                        if (suggestion) toggleSuggested(suggestion)
                                    }
                                }}
                                className="text-gray-500 hover:text-red-600 text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {gaps.length === 0 && (
                <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                    No gaps identified yet. Choose from suggestions above or add your own.
                </p>
            )}

            {/* Add Custom Gap */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Add custom gap
                </label>
                <div className="flex gap-2">
                    <input
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-opacity-20"
                        placeholder="e.g., Time management, Technical skills..."
                        value={newGap}
                        onChange={e => setNewGap(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") add()
                        }}
                    />
                    <button
                        onClick={add}
                        disabled={!newGap.trim()}
                        className="px-6 py-2 text-sm font-medium text-white bg-orange-700 rounded-lg hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>
        </section>
    )
}