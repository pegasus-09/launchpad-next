type Props = {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-teal-100">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}
