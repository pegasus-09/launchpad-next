"use client"

import { useState } from "react"
import AuthLayout from "../../components/AuthLayout"
import { supabase } from "../../lib/supabaseClient"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }
  return (
    <AuthLayout side="left" bgColor="bg-teal-400">
      <h1 className="text-4xl font-bold text-black">
        <span className="text-teal-400">Log in</span>
        <br />
        to your account
      </h1>

      <div className="mt-10 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-5 py-3 text-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-black"
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-teal-400 py-3 font-medium text-teal-500 hover:bg-teal-50 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 hover:text-gray-700">
        <a href="/signup" className="underline">
          I don&apos;t have an account
        </a>
      </p>
    </AuthLayout>
  )
}
