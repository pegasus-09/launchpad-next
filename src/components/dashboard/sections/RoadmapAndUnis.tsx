export default function RoadmapAndUniversities() {
  return (
    <section className="grid gap-6 md:grid-cols-2 mb-10">
      <div className="rounded-2xl border bg-white p-6 md:ml-10 md:mr-5 sm:mx-10">
        <h3 className="mb-3 font-semibold">Career roadmap</h3>
        <div className="h-32 rounded-lg border bg-gray-50" />
        <button className="mt-4 text-sm text-violet-500 underline">
          View full roadmap
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-6 md:ml-5 md:mr-10 sm:mx-10">
        <h3 className="mb-3 font-semibold">Top universities for you</h3>
        <ul className="space-y-2 text-sm">
          <li>University A</li>
          <li>University B</li>
          <li>University C</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Based on your education level and preferences
        </p>
      </div>
    </section>
  )
}
