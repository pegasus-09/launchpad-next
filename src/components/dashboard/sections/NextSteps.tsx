const steps = [
  { label: "Complete career quiz", done: true },
  { label: "Explore colleges", done: false },
  { label: "Generate a resume", done: false },
]

export default function NextSteps() {
  const completed = steps.filter(s => s.done).length
  const progress = Math.round((completed / steps.length) * 100)

  return (
    <section className="rounded-2xl border bg-white p-6 mx-10">
      <h2 className="mb-4 text-lg font-semibold">Next steps</h2>

      <ul className="space-y-2">
        {steps.map(step => (
          <li key={step.label} className="flex items-center gap-3">
            <span
              className={`h-4 w-4 rounded border ${
                step.done ? "bg-violet-500 border-violet-500" : "border-gray-400"
              }`}
            />
            <span className={step.done ? "text-gray-400 line-through" : ""}>
              {step.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <div className="mb-1 text-sm text-gray-600">
          Completion
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-violet-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  )
}
