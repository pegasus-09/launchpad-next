const steps = [
  "Take the career assessment (no login required)",
  "Create an account to save and view your results",
  "Explore your personalised dashboard with career recommendations",
  "Build your portfolio and export as PDF for applications",
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-gray-50">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-10 text-3xl font-bold text-black">How it works</h2>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-6 border-b pb-6 last:border-b-0"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xl font-bold text-white">
                {index + 1}
              </div>
              <p className="text-lg text-gray-700 pt-2">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
