"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { studentApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"

interface Subject {
  name: string
  category?: string
  source?: string
}

export default function SubjectsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [yearLevel, setYearLevel] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        await requireRole("student")
        const data = await studentApi.getPortfolio()

        // Use saved portfolio subjects if available, otherwise autofill
        if (data.portfolio?.subjects?.length) {
          setSubjects(data.portfolio.subjects)
        } else if (data.autofill?.subjects?.length) {
          setSubjects(data.autofill.subjects.map((s: Subject) => ({ ...s, source: "system" })))
        }

        setYearLevel(data.portfolio?.year_level || data.autofill?.year_level || "")
      } catch (err: unknown) {
        console.error("Subjects load error:", err)
        if (err instanceof Error) {
          if (err.message.includes("Unauthorized") || err.message.includes("role")) {
            router.replace("/login")
            return
          }
          setError(err.message)
        } else {
          setError("Failed to load subjects")
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  // Group subjects by category
  const grouped: Record<string, Subject[]> = {}
  const uncategorised: Subject[] = []
  for (const subj of subjects) {
    if (subj.category) {
      if (!grouped[subj.category]) grouped[subj.category] = []
      grouped[subj.category].push(subj)
    } else {
      uncategorised.push(subj)
    }
  }
  const categoryNames = Object.keys(grouped).sort()

  return (
    <div className="bg-linear-to-br from-violet-50 via-white to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 pb-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-500 mt-1">
            {yearLevel ? `Year ${yearLevel}` : "Your enrolled subjects"}
            {subjects.length > 0 && ` \u2022 ${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256" className="mx-auto mb-4 text-gray-300" fill="currentColor">
              <path d="M224 48h-64a40 40 0 0 0-32 16a40 40 0 0 0-32-16H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h64a24 24 0 0 1 24 24a8 8 0 0 0 16 0a24 24 0 0 1 24-24h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16M96 192H32V64h64a24 24 0 0 1 24 24v112a40 40 0 0 0-24-8m128 0h-64a40 40 0 0 0-24 8V88a24 24 0 0 1 24-24h64Z"/>
            </svg>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">No subjects yet</h2>
            <p className="text-gray-500 text-sm">
              Subjects will appear here once you&apos;re enrolled in classes.
              You can also add subjects in your <a href="/student/portfolio" className="text-violet-600 hover:underline">Portfolio</a>.
            </p>
          </div>
        ) : (
          <>
            {/* Categorised subjects */}
            {categoryNames.map((category) => (
              <div key={category} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[category].map((subj, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{subj.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Uncategorised subjects */}
            {uncategorised.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                {categoryNames.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Other</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uncategorised.map((subj, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{subj.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
