"use client";
// TODO: improve make the visual section on the side smaller
import { useState, Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    async function handleLogin() {
        setError(null);
        setLoading(true);

        const supabase = createClient();
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
            router.push("/redirect");
        }

        setLoading(false);
    }

    return (
        <AuthLayout side="left" bgColor="bg-linear-to-br from-violet-500 to-teal-400">
            <h1 className="text-4xl font-bold text-black">
                <span className="text-violet-500">Log in</span>
                <br />
                to your account
            </h1>

            {message && (
                <div className="mt-4 rounded-xl bg-violet-50 border border-violet-200 p-3">
                    <p className="text-sm text-violet-800">{message}</p>
                </div>
            )}

            <div className="mt-10 space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-3 text-black focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-black focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />

                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-medium text-white cursor-pointer hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>

                {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}
            </div>

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
