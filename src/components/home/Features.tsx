import FeatureCard from "./FeatureCard"

// Phosphor-style SVG icons
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="text-violet-600">
    <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m0-160a72 72 0 1 0 72 72a72.08 72.08 0 0 0-72-72m0 128a56 56 0 1 1 56-56a56.06 56.06 0 0 1-56 56m0-96a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 64a24 24 0 1 1 24-24a24 24 0 0 1-24 24"/>
  </svg>
)

const ChartLineUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="text-violet-600">
    <path fill="currentColor" d="M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v94.37l52.69-52.68a8 8 0 0 1 11.31 0L128 113.69l58.34-58.35a8 8 0 0 1 11.32 11.32l-64 64a8 8 0 0 1-11.31 0L98.34 106.34L40 164.69V200h184a8 8 0 0 1 8 8"/>
  </svg>
)

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="text-violet-600">
    <path fill="currentColor" d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48zm-32-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8"/>
  </svg>
)

export default function Features() {
  return (
    <section id="features" className="bg-linear-to-b from-teal-50/30 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl md:text-4xl font-bold text-gray-900">
          Comprehensive career guidance tools
        </h2>
        <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
          Evidence-based assessment and personalised recommendations for every student.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<TargetIcon />}
            title="Psychometric Assessment"
            description="A comprehensive questionnaire evaluating aptitudes, interests, personality traits, values, and work style preferences."
          />
          <FeatureCard
            icon={<ChartLineUpIcon />}
            title="Personalised Career Matches"
            description="Ranked career recommendations based on deterministic matching algorithms that analyse each student's unique profile."
          />
          <FeatureCard
            icon={<FileTextIcon />}
            title="Portfolio Builder"
            description="Students create professional portfolios highlighting projects, strengths, and experiences — exportable as PDF."
          />
        </div>
      </div>
    </section>
  )
}
