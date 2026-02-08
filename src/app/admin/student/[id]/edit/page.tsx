"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { ArrowLeft, Search } from "lucide-react"

interface ClassOption {
  id: string
  class_name: string
  year_level?: string
  subject_name?: string
}

interface StudentProfile {
  id: string
  full_name: string
  email: string
  year_level: string
  class_ids?: string[]
  class_names?: string[]
  class_id?: string | null
}

interface StudentProfileResponse {
  profile: StudentProfile
}

interface ClassesResponse {
  classes?: ClassOption[]
}

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [classSearch, setClassSearch] = useState("")
  const [showYearWarning, setShowYearWarning] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    year_level: "",
    class_ids: [] as string[]
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        await requireRole("admin")

        const [studentRes, classesRes] = (await Promise.all([
          adminApi.getStudentProfile(studentId),
          adminApi.getAllClasses()
        ])) as [StudentProfileResponse, ClassesResponse]

        const profile = studentRes.profile
        setStudent(profile)
        setClasses(classesRes.classes || [])

        const initialClassIds = Array.isArray(profile.class_ids)
          ? profile.class_ids
          : profile.class_id
            ? [profile.class_id]
            : []

        setFormData({
          full_name: profile.full_name || "",
          year_level: profile.year_level || "",
          class_ids: initialClassIds
        })
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to load student")
        } else {
          setError("Failed to load student")
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [studentId])

  const eligibleClasses = useMemo(() => {
    return classes.filter((cls) => cls.year_level === formData.year_level)
  }, [classes, formData.year_level])

  const filteredClasses = useMemo(() => {
    const query = classSearch.trim().toLowerCase()
    if (!query) return eligibleClasses
    return eligibleClasses.filter((cls) =>
      cls.class_name.toLowerCase().includes(query) ||
      (cls.subject_name || "").toLowerCase().includes(query)
    )
  }, [eligibleClasses, classSearch])

  const allFilteredSelected = filteredClasses.length > 0 && filteredClasses.every(
    (cls) => formData.class_ids.includes(cls.id)
  )

  function toggleClass(classId: string) {
    setFormData((prev) => ({
      ...prev,
      class_ids: prev.class_ids.includes(classId)
        ? prev.class_ids.filter((id) => id !== classId)
        : [...prev.class_ids, classId]
    }))
  }

  function toggleSelectAll() {
    if (filteredClasses.length === 0) return
    const filteredIds = filteredClasses.map((cls) => cls.id)
    setFormData((prev) => {
      if (allFilteredSelected) {
        return { ...prev, class_ids: prev.class_ids.filter((id) => !filteredIds.includes(id)) }
      }
      const merged = new Set([...prev.class_ids, ...filteredIds])
      return { ...prev, class_ids: Array.from(merged) }
    })
  }

  async function handleSave() {
    if (!formData.full_name || !formData.year_level) {
      alert("Please fill in name and year level.")
      return
    }

    try {
      setSaving(true)
      await adminApi.updateStudent(studentId, {
        full_name: formData.full_name,
        year_level: formData.year_level,
        class_ids: formData.class_ids
      })
      router.push(`/admin/student/${studentId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      alert("Failed to update student: " + message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading student...</div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-rose-700">Error: {error || "Student not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push(`/admin/student/${studentId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Student</h1>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level
              </label>
              <input
                type="text"
                value={formData.year_level}
                onChange={(e) => {
                  if (e.target.value !== formData.year_level) {
                    setFormData((prev) => ({ ...prev, year_level: e.target.value, class_ids: [] }))
                    setShowYearWarning(true)
                  } else {
                    setFormData((prev) => ({ ...prev, year_level: e.target.value }))
                  }
                }}
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {showYearWarning && (
                <p className="text-xs text-rose-700 mt-1">
                  Year level changed. Class selections were cleared to match the new year.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Classes (Year {formData.year_level})
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  {allFilteredSelected ? 'Clear filtered' : 'Select filtered'}
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div className="border border-violet-100 rounded-lg max-h-60 overflow-y-auto">
                {filteredClasses.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No classes available for this year.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredClasses.map((cls) => (
                      <li key={cls.id} className="p-3 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={formData.class_ids.includes(cls.id)}
                          onChange={() => toggleClass(cls.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cls.class_name}</p>
                          <p className="text-xs text-gray-500">
                            {cls.subject_name ? `${cls.subject_name} • ` : ''}Year {cls.year_level}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected {formData.class_ids.length} class{formData.class_ids.length !== 1 ? 'es' : ''}.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Students can only be assigned to classes in the same year level.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={() => router.push(`/admin/student/${studentId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-linear-to-r from-violet-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
