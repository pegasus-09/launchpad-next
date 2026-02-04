"use client"

import { useState } from "react"
import { normaliseRankingScore } from "@/lib/normalise"

type RankingItem = [string, string, number]

type RankingsProps = {
    ranking: RankingItem[]
    limit?: number
}

// Normalise score from range [-10.4, 17] to [0, 100]

export default function Rankings({
    ranking,
    limit = 10,
}: RankingsProps) {
    const [showAll, setShowAll] = useState(false)
    const displayLimit = showAll ? limit : 5

    if (!ranking || ranking.length === 0) {
        return (
            <section className="rounded-2xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">
                    Recommended careers
                </h2>

                <p className="text-sm text-gray-500">
                    No recommendations available.
                </p>
            </section>
        )
    }

    const getMatchReasoningText = (normalizedScore: number): string => {
        if (normalizedScore >= 85) {
            return "Exceptional match - Your strengths, interests, and values align exceptionally well with this career."
        } else if (normalizedScore >= 75) {
            return "Strong match - This career aligns well with your profile and natural inclinations."
        } else if (normalizedScore >= 65) {
            return "Good match - Many aspects of this career suit your abilities and preferences."
        } else {
            return "Moderate match - Some elements of this career align with your profile."
        }
    }

    return (
        <section className="rounded-2xl border bg-white p-6 mx-10">
            <h2 className="mb-4 text-lg font-semibold">
                Top career recommendations
            </h2>

            <p className="mb-6 text-sm text-gray-600">
                Based on your assessment, here are your best career matches ranked by compatibility score.
            </p>

            <ol className="space-y-3 text-sm">
                {ranking.slice(0, displayLimit).map((item, idx) => {
                    const normalizedScore = normaliseRankingScore(item[2])
                    return (
                        <li
                            key={item[0]}
                            className="flex flex-col gap-2 rounded border px-4 py-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <div className="text-base font-medium">
                                            {item[1]}
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {item[0]}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end text-right space-y-0.5">
                                    <span className="text-gray-700 text-sm font-semibold">
                                        {normalizedScore}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        match
                                    </span>
                                </div>
                            </div>

                            {showAll && (
                                <p className="text-xs text-gray-600 pl-11 border-t mt-2 pt-2">
                                    {getMatchReasoningText(Number(normalizedScore))}
                                </p>
                            )}
                        </li>
                    )
                })}
            </ol>

            {ranking.length > 5 && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline cursor-pointer"
                    >
                        {showAll 
                            ? "Show less" 
                            : `Show ${Math.min(limit, ranking.length) - 5} more careers with reasoning`
                        }
                    </button>
                </div>
            )}
        </section>
    )
}

