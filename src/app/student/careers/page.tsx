"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { studentApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { X, Search, Briefcase } from "lucide-react"

interface Career {
  soc_code: string
  title: string
}

export default function CareersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Career[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Career[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        await requireRole("student")
        const data = await studentApi.getCareerAspirations()
        setSelected(data.aspirations?.map((a: { soc_code: string; title: string }) => ({
          soc_code: a.soc_code,
          title: a.title,
        })) || [])
      } catch {
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const searchCareers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setSearching(true)
    try {
      const data = await studentApi.searchCareers(q)
      setResults(data.results || [])
      setShowDropdown(true)
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setSearching(false)
    }
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    setSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchCareers(value), 300)
  }

  function addCareer(career: Career) {
    if (selected.some((s) => s.soc_code === career.soc_code)) return
    setSelected((prev) => [...prev, career])
    setQuery("")
    setResults([])
    setShowDropdown(false)
    setSaved(false)
  }

  function removeCareer(socCode: string) {
    setSelected((prev) => prev.filter((c) => c.soc_code !== socCode))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await studentApi.saveCareerAspirations(selected.map((c) => c.soc_code))
      setSaved(true)
    } catch (err) {
      console.error("Save error:", err)
      alert("Failed to save career aspirations")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Career Goals</h1>
          <p className="text-gray-600 mt-1">
            Search and select careers you&apos;re interested in pursuing.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Search Careers</h2>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search by job title (e.g. Software Developer, Nurse, Engineer...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600" />
                </div>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {results.map((career) => {
                  const isSelected = selected.some((s) => s.soc_code === career.soc_code)
                  return (
                    <button
                      key={career.soc_code}
                      onClick={() => addCareer(career)}
                      disabled={isSelected}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-violet-50 text-violet-400"
                          : "hover:bg-violet-50 text-gray-900"
                      }`}
                    >
                      <div className="font-medium text-sm">{career.title}</div>
                    </button>
                  )
                })}
              </div>
            )}

            {showDropdown && query.trim().length >= 2 && results.length === 0 && !searching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm text-gray-500 text-center">
                No careers found matching &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Selected Careers */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Selected Careers ({selected.length})
            </h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save"}
            </button>
          </div>

          {selected.length === 0 ? (
            <div className="text-center py-8 bg-violet-50 rounded-xl border border-violet-200">
              <Briefcase className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <p className="text-violet-800 font-medium">No careers selected yet</p>
              <p className="text-sm text-violet-600 mt-1">
                Use the search above to find careers you&apos;re interested in.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selected.map((career) => (
                <div
                  key={career.soc_code}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{career.title}</h3>
                  </div>
                  <button
                    onClick={() => removeCareer(career.soc_code)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
