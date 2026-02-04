import Link from "next/link"
import { normaliseRankingScore } from "@/lib/normalise"

interface SuggestionItem {
  title?: string
  signal?: string
  score?: number
}

interface AssessmentSuggestions {
  strengths?: SuggestionItem[]
  gaps?: SuggestionItem[]
}

interface StrengthsAndGapsProps {
  assessmentSuggestions: AssessmentSuggestions | null
}

function formatTitle(text: string): string {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}


export default function StrengthsAndGaps({ assessmentSuggestions }: StrengthsAndGapsProps) {
  const strengths = assessmentSuggestions?.strengths || []
  const gaps = assessmentSuggestions?.gaps || []

  const topStrengths = strengths.slice(0, 3)
  const topGaps = gaps.slice(0, 3)

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 md:ml-10 md:mr-5 sm:mx-10">
        <h3 className="mb-3 font-semibold">Top strengths</h3>
        {topStrengths.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {topStrengths.map((strength, idx) => (
              <li key={idx}>
                {strength.score != null ? `${normaliseRankingScore(strength.score)}% - ` : '- '}
                {formatTitle(strength.title || strength.signal || "Unknown")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            Complete the assessment to see your strengths
          </p>
        )}
        <Link href="/portfolio" className="mt-4 text-sm text-violet-500 underline block">
          Build portfolio
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6 md:ml-5 md:mr-10 sm:mx-10">
        <h3 className="mb-3 font-semibold">Areas to develop</h3>
        {topGaps.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {topGaps.map((gap, idx) => (
              <li key={idx} className="text-gray-700">
                {gap.score != null ? `${normaliseRankingScore(gap.score)}% - ` : '- '}
                {formatTitle(gap.title || gap.signal || "Unknown")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            Complete the assessment to see development areas
          </p>
        )}
        <Link href="/portfolio" className="mt-4 text-sm text-violet-500 underline block">
          Build portfolio
        </Link>
      </div>
    </section>
  )
}
