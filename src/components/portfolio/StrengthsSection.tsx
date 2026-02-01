"use client"

import { useState } from "react"

export type PortfolioSignal = {
    category?: string
    signal: string
    description?: string
    percentile?: number
    source: "assessment" | "user"
}

type SuggestedStrength = {
    signal: string
    description?: string
    category?: string
    percentile?: number
}

type Props = {
    strengths: PortfolioSignal[]
    suggestedStrengths: SuggestedStrength[]
    selectedAssessmentStrengths: Set<string>
    onChange: (strengths: PortfolioSignal[]) => void
}

export default function StrengthsSection({
    strengths,
    suggestedStrengths,
    selectedAssessmentStrengths,
    onChange,
}: Props) {
    const [newStrength, setNewStrength] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(true)

    function toggleSuggested(suggestion: SuggestedStrength) {
        const exists = strengths.some(
            s =>
                s.signal === suggestion.signal &&
                s.source === "assessment"
        )

        if (exists) {
            onChange(
                strengths.filter(
                    s =>
                        !(
                            s.signal === suggestion.signal &&
                            s.source === "assessment"
                        )
                )
            )
        } else {
            onChange([
                ...strengths,
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
        const newStrengths = suggestedStrengths
            .filter(s => !selectedAssessmentStrengths.has(s.signal))
            .map(s => ({
                signal: s.signal,
                description: s.description,
                category: s.category,
                percentile: s.percentile,
                source: "assessment" as const,
            }))

        onChange([...strengths, ...newStrengths])
    }

    function remove(index: number) {
        onChange(strengths.filter((_, i) => i !== index))
    }

    function add() {
        if (!newStrength.trim()) return

        onChange([
            ...strengths,
            {
                signal: newStrength.trim(),
                source: "user",
            },
        ])

        setNewStrength("")
    }

    const unselectedSuggestions = suggestedStrengths.filter(
        s => !selectedAssessmentStrengths.has(s.signal)
    )

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-green-900">Strengths</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Click on the AI-suggested strengths below to add them, or add your own.
                </p>
            </div>

            {/* Suggestions - Moved to top */}
            {unselectedSuggestions.length > 0 && (
                <div className="space-y-3 bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="flex items-center gap-2 text-sm font-semibold text-green-900 hover:text-green-700 cursor-pointer"
                        >
                            <span>{showSuggestions ? "▼" : "▶"}</span>
                            <span>
                                AI-Suggested Strengths ({unselectedSuggestions.length})
                            </span>
                        </button>

                        {unselectedSuggestions.length > 0 && (
                            <button
                                onClick={addAllSuggestions}
                                className="text-xs font-medium text-green-700 hover:text-green-900 underline cursor-pointer"
                            >
                                Add all
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {unselectedSuggestions.map(s => (
                                <button
                                    key={s.signal}
                                    onClick={() => toggleSuggested(s)}
                                    className="text-left p-3 rounded-lg border border-dashed border-green-400 bg-white hover:border-green-600 hover:bg-green-50 transition-all text-sm capitalize cursor-pointer"
                                >
                                    + {s.signal === "work_life_balance" 
                                        ? "Work-Life Balance" 
                                        : s.signal.replaceAll("_", " ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Strengths */}
            {strengths.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Your Strengths</h3>
                    {strengths.map((s, i) => (
                        <div
                            key={`${s.signal}-${i}`}
                            className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-300 bg-white"
                        >
                            <span className="font-medium capitalize text-green-900">
                                {s.signal === "work_life_balance" 
                                    ? "Work-Life Balance" 
                                    : s.signal.replaceAll("_", " ")}
                            </span>

                            <button
                                onClick={() => {
                                    if (s.source === "user") {
                                        remove(i)
                                    } else {
                                        const suggestion = suggestedStrengths.find(
                                            sg => sg.signal === s.signal
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

            {strengths.length === 0 && (
                <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                    No strengths selected yet. Choose from AI suggestions above or add your own.
                </p>
            )}

            {/* Add Your Own */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    Add your own
                </label>
                <div className="flex gap-2">
                    <input
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-20"
                        placeholder="e.g., Leadership, Communication..."
                        value={newStrength}
                        onChange={e => setNewStrength(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") add()
                        }}
                    />
                    <button
                        onClick={add}
                        disabled={!newStrength.trim()}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>
        </section>
    )
}