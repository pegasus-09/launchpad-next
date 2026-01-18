import AuthLayout from "../../components/AuthLayout"

export default function LoginPage() {
  return (
    <AuthLayout side="left" bgColor="bg-teal-400">
      <h1 className="text-4xl font-bold text-gray-600">
        <span className="text-teal-400">Log in</span>
        <br />
        to your account
      </h1>

      <form className="mt-10 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border px-5 py-3 text-black"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border px-4 py-3 text-black"
        />

        <button
          type="submit"
          className="mt-4 w-full rounded-lg border px-20 border-teal-400 py-3 font-medium text-teal-500 hover:bg-teal-50"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        <a href="/signup" className="underline">
          I don't have an account
        </a>
      </p>
    </AuthLayout>
  )
}
