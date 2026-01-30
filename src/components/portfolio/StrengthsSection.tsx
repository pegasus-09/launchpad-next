"use client"

import { useState } from "react"

export type PortfolioSignal = {
    category?: string
    signal: string
    description?: string
    percentile?: number
}

type Props = {
    strengths: PortfolioSignal[]
    onChange: (strengths: PortfolioSignal[]) => void
}

export default function StrengthsSection({ strengths, onChange }: Props) {
    const [newStrength, setNewStrength] = useState("")

    function remove(index: number) {
        onChange(strengths.filter((_, i) => i !== index))
    }

    function add() {
        if (!newStrength.trim()) return

        onChange([
            ...strengths,
            { signal: newStrength.trim() }
        ])

        setNewStrength("")
    }

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-medium">Strengths</h2>

            {!strengths.length && (
                <p className="text-sm text-muted-foreground">
                    No strengths added yet.
                </p>
            )}

            <ul className="space-y-2">
                {strengths.map((s, i) => (
                    <li
                        key={i}
                        className="rounded-md border border-gray-200 p-3 text-sm flex justify-between gap-4"
                    >
                        <span>
                            {s.signal && (
                                <span className="font-medium capitalize">
                                    {s.signal.replace("_", " ")}{" "}
                                </span>
                            )}
                            {/* {s.description} */}
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
                    placeholder="Add a strength"
                    value={newStrength}
                    onChange={e => setNewStrength(e.target.value)}
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
