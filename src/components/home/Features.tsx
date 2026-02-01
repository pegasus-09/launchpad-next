import FeatureCard from "./FeatureCard"

export default function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-black">
          Packed with features to help you grow
        </h2>

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
