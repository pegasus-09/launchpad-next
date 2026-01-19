import LogoutButton from "@/components/auth/LogoutButton"

export default function WelcomeHeader() {
  return (
    <section className="mb-2 flex items-center justify-between px-6 py-10">
      <div>
        <h1 className="text-3xl font-bold">
            Welcome back, <span className="text-violet-500">Adi</span>
        </h1>
        <p className="mt-2 text-gray-600">
            Here's a snapshot of your progress so far.
        </p>
      </div>
      <LogoutButton />
    </section>
  )
}
