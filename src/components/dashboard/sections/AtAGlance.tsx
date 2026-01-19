export default function AtAGlance() {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">At a glance</h2>

      <div className="flex items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-violet-500 text-xl font-bold">
          90%
        </div>

        <div>
          <h3 className="text-xl font-semibold">Example career</h3>
          <p className="mt-1 text-gray-600">
            Based on your skills, interests, and preferences so far.
          </p>
        </div>
      </div>
    </section>
  )
}
