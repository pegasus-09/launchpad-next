// src/lib/api.ts
// Backend API client with authentication and role-based endpoints
// UPDATED VERSION with admin teacher/subject/reports endpoints

import { createClient } from '@/lib/supabase/client'
import { UserProfile } from './auth/roleCheck'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

// Helper for authenticated requests
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// ============================================================================
// GUEST API (No authentication required)
// ============================================================================

export const guestApi = {
  /**
   * Submit assessment as guest (preview only)
   */
  async submitAssessment(answers: Record<string, number>) {
    const response = await fetch(`${API_URL}/guest/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to submit assessment: ${error}`)
    }

    return response.json()
  },
}

// ============================================================================
// AUTHENTICATED API (Requires user to be logged in)
// ============================================================================
export const authApi = {
  /**
   * Get current user's school
   */
  async getSchool(userProfile: UserProfile) {
    const supabase = createClient()
    if (userProfile === null) {
      throw new Error('Not authenticated')
    }
    const { data: schoolData } = await supabase
          .from('schools')
          .select('name')
          .eq('id', userProfile.school_id)
          .single()
    return schoolData
  },
}

// ============================================================================
// STUDENT API
// ============================================================================

export const studentApi = {
  /**
   * Submit assessment and save results
   */
  async submitAssessment(answers: Record<string, number>) {
    const response = await authenticatedFetch('/student/assessment', {
      method: 'POST',
      body: JSON.stringify({ answers })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to submit assessment: ${error}`)
    }

    return response.json()
  },

  /**
   * Get student profile with all data
   */
  async getProfile() {
    const response = await authenticatedFetch('/student/profile')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load profile: ${error}`)
    }

    return response.json()
  },

  /**
   * Add work experience
   */
  async addWorkExperience(data: {
    title: string
    organisation: string
    description?: string
    start_date: string
    end_date?: string
  }) {
    const response = await authenticatedFetch('/student/work-experience', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add work experience: ${error}`)
    }

    return response.json()
  },

  async getPortfolio() {
    const response = await authenticatedFetch('/student/portfolio')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load portfolio: ${error}`)
    }

    return response.json()
  },

  async searchCareers(query: string) {
    const response = await authenticatedFetch(`/careers/search?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to search careers: ${error}`)
    }

    return response.json()
  },

  async getCareerAspirations() {
    const response = await authenticatedFetch('/student/career-aspirations')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load career aspirations: ${error}`)
    }

    return response.json()
  },

  async saveCareerAspirations(socCodes: string[]) {
    const response = await authenticatedFetch('/student/career-aspirations', {
      method: 'PUT',
      body: JSON.stringify({ soc_codes: socCodes }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save career aspirations: ${error}`)
    }

    return response.json()
  },

  async savePortfolio(data: {
    summary?: string
    year_level?: string
    subjects?: Array<{ name: string; category?: string; source?: string }>
    work_experience?: Array<{ title: string; organisation: string; description?: string; start_date?: string; end_date?: string; source?: string }>
    certifications?: Array<{ name: string; issuer?: string; date?: string }>
    volunteering?: Array<{ title: string; organisation: string; description?: string }>
    extracurriculars?: Array<{ name: string; role?: string; description?: string }>
    skills?: string[]
  }) {
    const response = await authenticatedFetch('/student/portfolio', {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save portfolio: ${error}`)
    }

    return response.json()
  },
}

// ============================================================================
// TEACHER API
// ============================================================================

export const teacherApi = {
  /**
   * Get all students the teacher teaches
   */
  async getStudents() {
    const response = await authenticatedFetch('/teacher/students')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load students: ${error}`)
    }

    return response.json()
  },

  /**
   * Get all classes the teacher teaches
   */
  async getClasses() {
    const response = await authenticatedFetch('/teacher/classes')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load classes: ${error}`)
    }

    return response.json()
  },

  /**
   * Get a specific student for the teacher, along with their classes taught by this teacher.
   * This assumes the backend endpoint exists and returns student details including relevant classes.
   */
  async getStudent(studentId: string) {
    const response = await authenticatedFetch(`/teacher/student/${studentId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to load student: ${error}`);
    }

    return response.json();
  },

  /**
   * Add or update a comment for a student in a class.
   */
  async upsertComment(data: {
    student_id: string
    class_id: string
    comment_text: string
    performance_rating?: number
    engagement_rating?: number
  }) {
    const response = await authenticatedFetch('/teacher/comment', {
      method: 'POST', // Stays POST as per backend route
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save comment: ${error}`)
    }

    return response.json()
  },

  /**
   * Get a teacher's comment for a student in a specific class.
   */
  async getComment(studentId: string, classId: string) {
    const response = await authenticatedFetch(`/teacher/student/${studentId}/class/${classId}/comment`);
    
    // A 404 from the gateway would be an error, but the endpoint should return 200 with null body if not found.
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to load comment: ${error}`);
    }
    
    // Handle cases where the response body is empty (comment doesn't exist)
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      // If parsing fails on a non-empty string, it's an issue.
      console.error("Failed to parse getComment response:", text);
      return null;
    }
  },

  /**
   * Delete a teacher's comment for a student in a specific class.
   */
  async deleteComment(studentId: string, classId: string) {
    const response = await authenticatedFetch(`/teacher/student/${studentId}/class/${classId}/comment`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete comment: ${error}`);
    }

    return response.json();
  },
}

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  /**
   * Get all students in the school
   */
  async getAllStudents() {
    const response = await authenticatedFetch('/admin/students')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load students: ${error}`)
    }

    return response.json()
  },

  /**
   * Get detailed student profile
   */
  async getStudentProfile(studentId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load student profile: ${error}`)
    }

    return response.json()
  },

  /**
   * Update student profile (name/year/class)
   */
  async updateStudent(studentId: string, data: {
    full_name?: string
    year_level?: string
    class_id?: string | null
    class_ids?: string[]
  }) {
    const response = await authenticatedFetch(`/admin/student/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update student: ${error}`)
    }

    return response.json()
  },

  /**
   * Delete student
   */
  async deleteStudent(studentId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete student: ${error}`)
    }

    return response.json()
  },

  /**
   * Get school-wide statistics
   */
  async getSchoolStats() {
    const response = await authenticatedFetch('/admin/stats')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load statistics: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // TEACHER MANAGEMENT
  // ========================================================================

  /**
   * Get all teachers in the school
   */
  async getAllTeachers() {
    const response = await authenticatedFetch('/admin/teachers')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load teachers: ${error}`)
    }

    return response.json()
  },

  /**
   * Get detailed teacher profile
   */
  async getTeacherProfile(teacherId: string) {
    const response = await authenticatedFetch(`/admin/teacher/${teacherId}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load teacher profile: ${error}`)
    }

    return response.json()
  },

  /**
   * Add new teacher
   */
  async addTeacher(data: {
    email: string
    password: string
    full_name: string
  }) {
    const response = await authenticatedFetch('/admin/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add teacher: ${error}`)
    }

    return response.json()
  },

  /**
   * Update teacher profile
   */
  async updateTeacher(teacherId: string, data: {
    full_name?: string
    email?: string
  }) {
    const response = await authenticatedFetch(`/admin/teacher/${teacherId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update teacher: ${error}`)
    }

    return response.json()
  },

  /**
   * Delete teacher
   */
  async deleteTeacher(teacherId: string) {
    const response = await authenticatedFetch(`/admin/teacher/${teacherId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete teacher: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // SUBJECT MANAGEMENT
  // ========================================================================

  /**
   * Get all subjects in the school
   */
  async getAllSubjects() {
    const response = await authenticatedFetch('/admin/subjects')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load subjects: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // CLASS MANAGEMENT
  // ========================================================================

  /**
   * Get all classes in the school
   */
  async getAllClasses() {
    const response = await authenticatedFetch('/admin/classes')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load classes: ${error}`)
    }

    return response.json()
  },

  /**
   * Create new class
   */
  async createClass(data: {
    subject_id?: string
    subject_name?: string
    teacher_id: string
    year_level: string
    class_name: string
    student_ids?: string[]
  }) {
    const response = await authenticatedFetch('/admin/class', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create class: ${error}`)
    }

    return response.json()
  },

  /**
   * Update class
   */
  async updateClass(classId: string, data: {
    subject_id?: string
    subject_name?: string
    teacher_id?: string
    year_level?: string
    class_name?: string
    student_ids?: string[]
  }) {
    const response = await authenticatedFetch(`/admin/class/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update class: ${error}`)
    }

    return response.json()
  },

  /**
   * Delete class
   */
  async deleteClass(classId: string) {
    const response = await authenticatedFetch(`/admin/class/${classId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete class: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // REPORTS
  // ========================================================================

  /**
   * Get reports summary
   */
  async getReportsSummary() {
    const response = await authenticatedFetch('/admin/reports/summary')

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load reports: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // STUDENT PORTFOLIO (admin view)
  // ========================================================================

  async getStudentCareerAspirations(studentId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}/career-aspirations`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load career aspirations: ${error}`)
    }

    return response.json()
  },

  async getStudentPortfolio(studentId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}/portfolio`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load portfolio: ${error}`)
    }

    return response.json()
  },

  // ========================================================================
  // ADMIN NOTES
  // ========================================================================

  async getStudentNotes(studentId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}/notes`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load notes: ${error}`)
    }

    return response.json()
  },

  async addStudentNote(studentId: string, noteText: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}/note`, {
      method: 'POST',
      body: JSON.stringify({ note_text: noteText }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add note: ${error}`)
    }

    return response.json()
  },

  async deleteStudentNote(studentId: string, noteId: string) {
    const response = await authenticatedFetch(`/admin/student/${studentId}/note/${noteId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete note: ${error}`)
    }

    return response.json()
  },
}

// ============================================================================
// HELPER: Get current user's role
// ============================================================================

export async function getCurrentUserRole(): Promise<'student' | 'teacher' | 'admin' | null> {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !data) return null

  return data.role as 'student' | 'teacher' | 'admin'
}
