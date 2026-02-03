type Props = {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 transition-all hover:shadow-lg hover:border-violet-200 group">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-100 to-teal-100 text-2xl group-hover:from-violet-200 group-hover:to-teal-200 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}
