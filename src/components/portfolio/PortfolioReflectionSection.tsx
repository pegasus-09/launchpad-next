"use client"

import { useState } from "react"

type Props = {
    summary?: string
    onChange: (summary: string) => void
}

export default function PortfolioReflectionSection({ summary, onChange }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(summary ?? "")

    function startEditing() {
        setDraft(summary ?? "")
        setIsEditing(true)
    }

    function cancel() {
        setIsEditing(false)
    }

    function save() {
        onChange(draft.trim())
        setIsEditing(false)
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                    Personal Reflection
                </h2>

                {!isEditing && (
                    <button
                        onClick={startEditing}
                        className="text-sm text-gray-600 hover:underline cursor-pointer"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        rows={6}
                        placeholder="How do you interpret your strengths and growth areas?"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={save}
                            className="text-sm font-medium text-green-600 hover:underline cursor-pointer"
                        >
                            Save
                        </button>
                        <button
                            onClick={cancel}
                            className="text-sm text-muted-foreground hover:underline cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {summary || "No reflection added yet."}
                </p>
            )}
        </section>
    )
}
