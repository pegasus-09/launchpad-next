type Props = {
  icon: React.ReactNode
  title: string
  description: string
  index?: number
}

export default function FeatureCard({ icon, title, description, index = 0 }: Props) {
  return (
    <div
      className="rounded-2xl bg-white border border-gray-200 p-8"
      style={{ animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both` }}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-teal-100">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  )
}
