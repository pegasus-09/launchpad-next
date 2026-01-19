"use client";

import { useState } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <AuthLayout side="right" bgColor="bg-violet-500">
      <h1 className="text-4xl font-bold text-black">
        <span className="text-violet-500">Sign up</span>
        <br />
        for an account
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
          onClick={handleSignup}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-violet-500 py-3 font-medium text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 hover:text-gray-700">
        <a href="/login" className="underline">
          I already have an account
        </a>
      </p>
    </AuthLayout>
  );
}

