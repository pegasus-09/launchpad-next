import AuthLayout from "../../components/AuthLayout"

export default function SignupPage() {
  return (
    <AuthLayout side="right" bgColor="bg-violet-500">
      <h1 className="text-4xl font-bold text-gray-600">
        <span className="text-violet-500">Sign up</span>
        <br />
        for an account
      </h1>

      <form className="mt-10 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border px-4 py-3 text-black"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border px-4 py-3 text-black"
        />

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-violet-500 py-3 font-medium text-white hover:bg-violet-600"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        <a href="/login" className="underline">
          I already have an account
        </a>
      </p>
    </AuthLayout>
  )
}
