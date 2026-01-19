export default function StrengthsAndGaps() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="mb-3 font-semibold">Top strengths</h3>
        <ul className="space-y-2 text-sm">
          <li>98% — Analytical thinking</li>
          <li>97% — Problem solving</li>
          <li>96% — Creativity</li>
        </ul>
        <button className="mt-4 text-sm text-violet-500 underline">
          View all skills
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h3 className="mb-3 font-semibold">Key area to improve</h3>
        <p className="text-sm text-gray-700">
          Information gaps around career pathways and qualifications.
        </p>
        <button className="mt-4 text-sm text-violet-500 underline">
          Learn how to improve
        </button>
      </div>
    </section>
  )
}
