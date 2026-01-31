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

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-medium">
                Gaps
            </h2>

            {suggestedGaps.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Suggested from your assessment
                    </h3>

                    <ul className="space-y-2">
                        {suggestedGaps.map(g => {
                            const checked =
                                selectedAssessmentGaps.has(
                                    g.signal
                                )

                            return (
                                <li
                                    key={g.signal}
                                    className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                            toggleSuggested(g)
                                        }
                                    />

                                    <span className="capitalize">
                                        {g.signal === "work_life_balance" ? "Work-Life Balance" : g.signal.replaceAll("_", " ")}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

            {!gaps.length && (
                <p className="text-sm text-muted-foreground">
                    No gaps added yet.
                </p>
            )}

            <ul className="space-y-2">
                {gaps.map((g, i) => (
                    <li
                        key={`${g.signal}-${i}`}
                        className="rounded-md border border-gray-200 p-3 text-sm flex justify-between gap-4"
                    >
                        <span>
                            <span className="font-medium capitalize">
                                {g.signal === "work_life_balance" ? "Work-Life Balance" : g.signal.replaceAll("_", " ")}
                            </span>

                            {g.source === "assessment" && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (from assessment)
                                </span>
                            )}
                        </span>

                        <button
                            onClick={() => remove(i)}
                            className="text-sm text-red-500 hover:underline cursor-pointer"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    placeholder="Add a gap"
                    value={newGap}
                    onChange={e =>
                        setNewGap(e.target.value)
                    }
                />
                <button
                    onClick={add}
                    className="text-sm font-medium text-green-600 hover:underline cursor-pointer"
                >
                    Add
                </button>
            </div>
        </section>
    )
}
