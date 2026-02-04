type RankingItem = [string, string, number]

interface AtAGlanceProps {
  ranking: RankingItem[] | null
}

// Normalise score from range [-10.4, 17] to [0, 100]
import { normaliseRankingScore } from "@/lib/normalise"

export default function AtAGlance({ ranking }: AtAGlanceProps) {
  const topCareer = ranking?.[0]

  if (!topCareer) {
    return null
  }

  const [, title, score] = topCareer
  const percentage = normaliseRankingScore(score)

  return (
    <section className="rounded-2xl border bg-white p-6 mx-10">
      <h2 className="mb-4 text-lg font-semibold">At a glance</h2>

      <div className="flex items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-violet-500 text-xl font-bold">
          {percentage}%
        </div>

        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-1 text-gray-600">
            Your top career match based on your assessment results.
          </p>
        </div>
      </div>
    </section>
  )
}
