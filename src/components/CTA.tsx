import Link from "next/link"

export default function CTA() {
  return (
    <section className="bg-black py-20 text-center text-white">
      <h2 className="text-4xl font-bold">
        Ready to find your future?
      </h2>

      <div className="mt-10">
        <Link href="/signup" className="rounded-lg bg-violet-500 px-8 py-3 text-lg font-medium hover:bg-violet-600">
          Sign up
        </Link>
      </div>
    </section>
  )
}
