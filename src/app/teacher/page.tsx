"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { teacherApi, authApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import LogoutButton from "@/components/auth/LogoutButton"
import Logo from "@/components/ui/Logo"

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  subjects: string[]
  class_names?: string[]
  class_ids?: string[]
}

interface TeacherClass {
  id: string
  class_name: string
  subject_name: string
  year_level?: string
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [teacherName, setTeacherName] = useState<string | null>(null)
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const effectRan = useRef(false);

  useEffect(() => {
    // Prevent double-invocation in strict mode
    if (effectRan.current === true) {
      return;
    }
    console.log("TeacherDashboard useEffect is running. This should now only appear once.");

    async function loadData() {
      try {
        // Check authentication and role
        const userProfile = await requireRole('teacher')
        setTeacherName(userProfile.full_name)

        // Load students and classes
        const [studentsData, classesData] = await Promise.all([
          teacherApi.getStudents(),
          teacherApi.getClasses()
        ])
        setStudents(studentsData.students || [])
        setClasses(classesData.classes || [])

        // Get school name
        const schoolData = await authApi.getSchool(userProfile)
        if (schoolData) {
          setSchoolName(schoolData.name)
        }

      } catch (err: unknown) {
        console.error('Teacher dashboard error:', err)
        if (err instanceof Error) {
          setError(err.message || 'Failed to load dashboard')
        } else {
          setError('Failed to load dashboard')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      effectRan.current = true
    }
  }, [])

  // Filter students by selected class
  const filteredStudents = selectedClassId === "all"
    ? students
    : students.filter(student =>
        student.class_ids?.includes(selectedClassId)
      )

  // Only show classes that have at least one student
  const classesWithStudents = classes.filter(cls =>
    students.some(student => student.class_ids?.includes(cls.id))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">Error</h2>
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
    <div className="max-w-6xl mx-auto px-20 py-6 space-y-8">
      {/* Header */}
      <div className="bg-gray-800 rounded-2xl shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-2">
              <Logo size="lg" variant="dark" /> 
              <span className="text-white text-xl">|</span>
              <p className="text-gray-300 mt-1.5">
                {schoolName ? schoolName : 'No school assigned'}
              </p>
            </div>
            <span className="text-md text-gray-500 mt-4">Welcome,</span>
            <h1 className="text-white text-3xl mt-1">{teacherName ? teacherName : 'Teacher'}</h1>
          </div>
          <LogoutButton variant="dark" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100">
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {students.length}
          </div>
          <div className="text-sm text-gray-600">Students</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {classes.length}
          </div>
          <div className="text-sm text-gray-600">Classes</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100">
          <div className="text-3xl font-bold text-violet-500 mb-2">
            {new Set(students.map(s => s.year_level)).size}
          </div>
          <div className="text-sm text-gray-600">Year Levels</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          My Students
        </h2>

        {/* Class Filter Tabs */}
        {classesWithStudents.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClassId("all")}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedClassId === "all"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700"
                }`}
              >
                All Classes
              </button>
              {classesWithStudents.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedClassId === cls.id
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700"
                  }`}
                >
                  {cls.class_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {selectedClassId === "all"
                ? "No students assigned yet."
                : "No students in this class."}
            </p>
            {selectedClassId === "all" && (
              <p className="text-sm text-gray-500">
                Contact your administrator to assign students to your subjects.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => router.push(`/teacher/student/${student.id}`)}
              >
                <div>
                  <h3 className="font-semibold text-emerald-800">{student.full_name}</h3>
                  <p className="text-sm text-gray-600">Year {student.year_level} • {student.email}</p>
                  {student.subjects && student.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center justify-center text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-violet-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
