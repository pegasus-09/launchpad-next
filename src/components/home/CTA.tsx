import Link from "next/link"

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-violet-600 via-violet-700 to-teal-600 py-24 text-center text-white">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="relative">
        <h2
          className="text-4xl md:text-5xl font-bold"
          style={{ animation: "fade-in-up 0.6s ease-out both" }}
        >
          Equip your students for the future
        </h2>
        <p
          className="mt-4 text-lg text-violet-100 max-w-2xl mx-auto"
          style={{ animation: "fade-in-up 0.6s ease-out 0.15s both" }}
        >
          Data-driven career guidance tailored to each student&apos;s strengths and aspirations
        </p>

        <div
          className="mt-10 flex justify-center gap-4"
          style={{ animation: "fade-in-up 0.6s ease-out 0.3s both" }}
        >
          <Link
            href="/login"
            className="group inline-flex items-center rounded-xl bg-white px-8 py-3.5 text-lg font-semibold text-violet-600 transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
          >
            Get Started
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
