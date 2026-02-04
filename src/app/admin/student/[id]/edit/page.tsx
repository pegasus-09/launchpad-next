"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { ArrowLeft } from "lucide-react"

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
  class_id?: string | null
  class_name?: string
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

  const [formData, setFormData] = useState({
    full_name: "",
    year_level: "",
    class_id: ""
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

        setFormData({
          full_name: profile.full_name || "",
          year_level: profile.year_level || "",
          class_id: profile.class_id || ""
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
        class_id: formData.class_id || null
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
        <div className="text-red-600">Error: {error || "Student not found"}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push(`/admin/student/${studentId}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student
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
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                    {cls.subject_name ? ` • ${cls.subject_name}` : ""}
                    {cls.year_level ? ` • Year ${cls.year_level}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Each student should be assigned to one class.
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
