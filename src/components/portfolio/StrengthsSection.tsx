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

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-medium">
                Strengths
            </h2>

            {suggestedStrengths.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Suggested from your assessment
                    </h3>

                    <ul className="space-y-2">
                        {suggestedStrengths.map(s => {
                            const checked =
                                selectedAssessmentStrengths.has(
                                    s.signal
                                )

                            return (
                                <li
                                    key={s.signal}
                                    className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                            toggleSuggested(s)
                                        }
                                    />

                                    <span className="capitalize">
                                        {s.signal === "work_life_balance" ? "Work-Life Balance" : s.signal.replaceAll("_", " ")}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

            {!strengths.length && (
                <p className="text-sm text-muted-foreground">
                    No strengths added yet.
                </p>
            )}

            <ul className="space-y-2">
                {strengths.map((s, i) => (
                    <li
                        key={`${s.signal}-${i}`}
                        className="rounded-md border border-gray-200 p-3 text-sm flex justify-between gap-4"
                    >
                        <span>
                            <span className="font-medium capitalize">
                                {s.signal === "work_life_balance" ? "Work-Life Balance" : s.signal.replaceAll("_", " ")}
                            </span>

                            {s.source === "assessment" && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (from assessment)
                                </span>
                            )}
                        </span>

                        <button
                            onClick={() => remove(i)}
                            disabled={s.source === "assessment"}
                            className="text-sm text-red-500 hover:underline cursor-pointer disabled:invisible"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    placeholder="Add a strength"
                    value={newStrength}
                    onChange={e =>
                        setNewStrength(e.target.value)
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
