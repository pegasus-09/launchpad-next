"use client"

import { useState } from "react"
import type { PortfolioSignal } from "./StrengthsSection"

type Props = {
    gaps: PortfolioSignal[]
    onChange: (gaps: PortfolioSignal[]) => void
}

export default function GapsSection({ gaps, onChange }: Props) {
    const [newGap, setNewGap] = useState("")

    function remove(index: number) {
        onChange(gaps.filter((_, i) => i !== index))
    }

    function add() {
        if (!newGap.trim()) return

        onChange([
            ...gaps,
            { signal: newGap.trim() }
        ])

        setNewGap("")
    }

    return (
        <section className="space-y-3">
            <h2 className="text-lg font-medium">Gaps</h2>

            {!gaps.length && (
                <p className="text-sm text-muted-foreground">
                    No gaps added yet.
                </p>
            )}

            <ul className="space-y-2">
                {gaps.map((g, i) => (
                    <li
                        key={i}
                        className="rounded-md border border-gray-200 p-3 text-sm flex justify-between gap-4"
                    >
                        <span>
                            {g.signal && (
                                <span className="font-medium capitalize">
                                    {g.signal.replace("_", " ")}{" "}
                                </span>
                            )}
                            {/* {g.description} */}
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
                    onChange={e => setNewGap(e.target.value)}
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
