import FeatureCard from "./FeatureCard"

export default function Features() {
  return (
    <section id="features" className="bg-linear-to-b from-teal-50/30 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl md:text-4xl font-bold text-gray-900">
          Packed with features to help you grow
        </h2>
        <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
          Everything you need to discover your ideal career path and build your professional future.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="🎯"
            title="Psychometric Assessment"
            description="Take a comprehensive quiz that evaluates your aptitudes, interests, personality traits, values, and work style preferences."
          />
          <FeatureCard
            icon="🧠"
            title="Personalised Career Matches"
            description="Get ranked career recommendations based on deterministic matching algorithms that analyse your unique profile."
          />
          <FeatureCard
            icon="📄"
            title="Portfolio Builder"
            description="Create a professional portfolio highlighting your projects, strengths, and experiences - export as PDF for applications."
          />
        </div>
      </div>
    </section>
  )
}
