"use client";

import { useState, useEffect, Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function SignupContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams()

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg) {
      setMessage(msg)
    }
  }, [searchParams])

  async function handleSignup() {
    setError(null);
    setLoading(true);

    if (!name.trim() || !educationLevel) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

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
      // Check if there are guest assessment results to save
      const guestAnswers = localStorage.getItem('guestAssessmentAnswers')
      const guestRanking = localStorage.getItem('guestAssessmentRanking')

      if (guestAnswers && guestRanking) {
        try {
          await supabase
            .from("assessment_results")
            .upsert({
              user_id: data.session.user.id,
              raw_answers: JSON.parse(guestAnswers),
              ranking: JSON.parse(guestRanking),
              updated_at: new Date().toISOString(),
            })

          localStorage.removeItem('guestAssessmentAnswers')
          localStorage.removeItem('guestAssessmentRanking')
          localStorage.removeItem('guestAssessmentDate')
        } catch (err) {
          console.error("Error saving guest results:", err)
        }
      }

      const hasGuestResults = guestAnswers && guestRanking
      router.push(hasGuestResults ? "/dashboard" : "/assessment")
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

      {message && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}

      <div className="mt-10 space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-5 py-3 text-black"
        />

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

        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="w-full rounded-lg border px-5 py-3 text-black"
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
          className="mt-4 w-full rounded-lg bg-violet-500 py-3 font-medium text-white cursor-pointer hover:bg-violet-600 disabled:opacity-50"
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}