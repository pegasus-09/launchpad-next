"use client";

import { useState, Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function SignupContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  async function handleSignup() {
    setError(null);
    setLoading(true);

    if (!name.trim() || !educationLevel) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          education_level: educationLevel,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/student/assessment")
    }

    setLoading(false);
  }

  return (
    <AuthLayout side="right" bgColor="bg-linear-to-br from-teal-400 to-violet-500">
      <h1 className="text-4xl font-bold text-black">
        <span className="text-teal-500">Sign up</span>
        <br />
        for an account
      </h1>

      {message && (
        <div className="mt-4 rounded-xl bg-teal-50 border border-teal-200 p-3">
          <p className="text-sm text-teal-800">{message}</p>
        </div>
      )}

      <div className="mt-10 space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        >
          <option value="">Select Education Level</option>
          <option value="high_school">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="working_professional">Working Professional</option>
        </select>

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-medium text-white cursor-pointer hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        <a href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
          I already have an account
        </a>
      </p>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
