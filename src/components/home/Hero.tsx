import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-40 bg-white">
      <div className="mx-auto max-w-3xl px-6 text-center white">
        <h1 className="text-5xl font-extrabold tracking-tight text-black">
          Discover your perfect career with{" "}
          <span className="text-violet-500">Launchpad</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Take our psychometric assessment to get personalised career recommendations
          based on your unique strengths, interests, and values.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/assessment" className="rounded-lg bg-violet-500 px-6 py-3 font-medium text-white hover:bg-violet-600 cursor-pointer">
            Take the quiz
          </Link>
          <a href="#features" className="rounded-lg border border-teal-400 px-6 py-3 font-medium text-teal-500 hover:bg-teal-50 cursor-pointer">
            Learn more
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No login required to start • Get instant results
        </p>
      </div>
    </section>
  )
}
