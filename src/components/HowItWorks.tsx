const steps = [
  "Sign up for a free account",
  "Take the career assessment",
  "Explore your personalised dashboard",
]

export default function HowItWorks() {
  return (
    <section className="py-28 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-10 text-3xl font-bold text-black">How it works</h2>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-6 border-b pb-6 last:border-b-0 text-2xl"
            >
              <span className="text-2xl font-bold text-violet-500 text-2xl">
                {index + 1}
              </span>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
