import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-40 bg-white">
      <div className="mx-auto max-w-3xl px-6 text-center white">
        <h1 className="text-5xl font-extrabold tracking-tight text-black">
          Blast off with{" "}
          <span className="text-violet-500">Launchpad</span>.
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          AI career guidance for students choosing their future.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/signup" className="rounded-lg bg-violet-500 px-6 py-3 font-medium text-white hover:bg-violet-600">
            Let's go
          </Link>
          <Link href="/" className="rounded-lg border border-teal-400 px-6 py-3 font-medium text-teal-500 hover:bg-teal-50">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  )
}
