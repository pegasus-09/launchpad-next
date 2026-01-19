import FeatureCard from "./FeatureCard"

export default function Features() {
  return (
    <section className="bg-white py-5">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-black">
          Packed with features to help you grow
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="🎯"
            title="Responsive Career Quiz"
            description="Answer adaptive questions that adjust in real time as your interests and strengths become clearer."
          />
          <FeatureCard
            icon="🧠"
            title="AI Tailored Insights"
            description="Get personalised guidance that maps your skills, preferences, and goals to realistic career paths."
          />
          <FeatureCard
            icon="📄"
            title="Instant Resume Builder"
            description="Turn your profile and results into a clear, professional resume in minutes."
          />
        </div>
      </div>
    </section>
  )
}
