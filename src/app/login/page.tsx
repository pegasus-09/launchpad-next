"use client";

import { useState, useEffect, Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const msg = searchParams.get('message')
        if (msg) {
            setMessage(msg)
        }
    }, [searchParams])

    async function handleLogin() {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
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
                    // Save the guest results to the database
                    const { error: saveError } = await supabase
                        .from("assessment_results")
                        .upsert({
                            user_id: data.session.user.id,
                            raw_answers: JSON.parse(guestAnswers),
                            ranking: JSON.parse(guestRanking),
                            updated_at: new Date().toISOString(),
                        })

                    if (saveError) {
                        console.error("Failed to save guest results:", saveError)
                    } else {
                        // Clear the stored guest data
                        localStorage.removeItem('guestAssessmentAnswers')
                        localStorage.removeItem('guestAssessmentRanking')
                        localStorage.removeItem('guestAssessmentDate')
                    }
                } catch (err) {
                    console.error("Error saving guest results:", err)
                }
            }

            router.push("/dashboard")
        }

        setLoading(false);
    }

    return (
        <AuthLayout side="left" bgColor="bg-teal-400">
            <h1 className="text-4xl font-bold text-black">
                <span className="text-teal-400">Log in</span>
                <br />
                to your account
            </h1>

            {message && (
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-sm text-blue-800">{message}</p>
                </div>
            )}

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
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full rounded-lg border px-4 py-3 text-black"
                />

                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-4 w-full rounded-lg border border-teal-400 py-3 font-medium text-teal-500 cursor-pointer hover:bg-teal-50 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>

                {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}
            </div>

            <p className="mt-6 text-sm text-gray-500 hover:text-gray-700">
                <a href="/signup" className="underline">
                    I don&apos;t have an account
                </a>
            </p>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}