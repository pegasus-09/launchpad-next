"use client"

import { useState } from "react"
import { generatePortfolio, savePortfolio, loadPortfolio } from "@/lib/portfolio"
import { supabase } from "@/lib/supabase/client"

export default function PortfolioTestPage() {
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function runTest() {
        setLoading(true)
        setError(null)
        setData(null)

        try {
            const sessionRes = await supabase.auth.getSession()
            const session = sessionRes.data.session

            if (!session) {
                throw new Error("No active session")
            }

            const fakeAnswers = {
                A1: 4,
                A2: 5,
                A3: 4,
                A4: 3,
                A5: 4,

                I1: 3,
                I2: 2,
                I3: 3,
                I4: 2,
                I5: 3,
                I6: 2,

                T1: 4,
                T2: 3,
                T3: 4,
                T4: 3,
                T5: 4,
                T6: 3,

                V1: 5,
                V2: 4,
                V3: 5,
                V4: 4,
                V5: 5,
                V6: 4,

                W1: 3,
                W2: 2,
                W3: 3,
                W4: 2
            }

            const generated = await generatePortfolio(fakeAnswers)

            console.log("Generated portfolio:", generated)

            setData(generated)

            await savePortfolio({
                user_id: session.user.id,
                strengths: generated.strengths,
                gaps: generated.gaps,
                projects: []
            })

            const loaded = await loadPortfolio(session.user.id)
            console.log("Loaded from DB:", loaded)

        } catch (e: any) {
            console.error(e)
            setError(e.message ?? "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <button onClick={runTest} disabled={loading}>
                {loading ? "Running..." : "Run portfolio test"}
            </button>

            {error && (
                <p style={{ color: "red", marginTop: 16 }}>
                    {error}
                </p>
            )}

            <pre style={{ marginTop: 24 }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}
