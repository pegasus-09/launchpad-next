"use client"

type RankingItem = [string, string, number]

type RankingsProps = {
    ranking: RankingItem[]
    limit?: number
}

export default function Rankings({
    ranking,
    limit = 10,
}: RankingsProps) {
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

    return (
        <section className="rounded-2xl border bg-white p-6 mx-10">
            <h2 className="mb-4 text-lg font-semibold">
                Recommended careers
            </h2>

            <ol className="space-y-2 text-sm">
                {ranking.slice(0, limit).map(item => (
                    <li
                        key={item[0]}
                        className="flex items-center justify-between rounded border px-3 py-2"
                    >
                        <div>
                            <div className="text-base">
                                {item[1]}
                            </div>
                        </div>

                        <div className="flex flex-col items-end text-right space-y-0.5">
                            <span className="text-gray-700 text-sm">
                                {item[2].toFixed(2)}
                            </span>

                            <span className="text-xs text-gray-400 font-mono">
                                {item[0]}
                            </span>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}
