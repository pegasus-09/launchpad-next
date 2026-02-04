import Link from "next/link"

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-violet-600 via-violet-700 to-teal-600 py-20 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="relative">
        <h2 className="text-4xl md:text-5xl font-bold">
          Equip your students for the future
        </h2>
        <p className="mt-4 text-lg text-violet-100 max-w-2xl mx-auto">
          Data-driven career guidance tailored to each student&apos;s strengths and aspirations
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login" className="rounded-xl bg-white px-8 py-3 text-lg font-medium text-violet-600 hover:bg-gray-100 transition-colors shadow-lg">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
