import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-32 bg-linear-to-b from-white via-violet-50/30 to-teal-50/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Career guidance for students with{" "}
          <span className="bg-linear-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent">Launchpad</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Psychometric assessments and personalised career recommendations
          tailored to each student&apos;s strengths, interests, and values.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login" className="rounded-xl bg-violet-600 px-8 py-3 font-medium text-white hover:bg-violet-700 cursor-pointer transition-colors shadow-lg shadow-violet-200">
            Get started
          </Link>
          <Link href="#features" className="rounded-xl border-2 border-teal-400 px-8 py-3 font-medium text-teal-600 hover:bg-teal-50 cursor-pointer transition-colors">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  )
}
