type Props = {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: Props) {
  return (
    <div className="rounded-2xl bg-teal-100 p-6 transition hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-200 text-teal-600 shadow-xl">
        {icon}
      </div>
      <h3 className="font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}
