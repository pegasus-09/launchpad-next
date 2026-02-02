import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// export async function generatePortfolio(answers: Record<string, number>) {
// 	const res = await fetch(`${API_URL}/portfolio/generate`, {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify(answers),
// 	})

// 	if (!res.ok) {
// 		throw new Error("Failed to generate portfolio")
// 	}
// 	console.log("Response status:", res.json)
// 	return res.json()
// }

// export async function savePortfolio(payload: {
// 	user_id: string
// 	strengths: any[]
// 	gaps: any[]
// 	projects?: any[]
// 	bio?: string
// }) {
// 	const res = await fetch(`${API_URL}/portfolio/save`, {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify(payload),
// 	})

// 	if (!res.ok) {
// 		throw new Error("Failed to save portfolio")
// 	}

// 	return res.json()
// }

// export async function loadPortfolio(userId: string) {
// 	const res = await fetch(`${API_URL}/portfolio?user_id=${userId}`)

// 	if (!res.ok) {
// 		throw new Error("Failed to load portfolio")
// 	}

// 	return res.json()
// }

export async function loadAssessmentResults(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("assessment_results")
        .select("raw_answers")
        .eq("user_id", userId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

