// src/lib/api.ts
// Backend API client with authentication and role-based endpoints

import { createClient } from '@/lib/supabase/client'
import { getCurrentUserProfile, UserProfile } from './auth/roleCheck'
import { use } from 'react'

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
      body: JSON.stringify({ answers }) // ← Wrapped in object
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
   * Get current user's profile
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }) // ← Wrapped in object
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add work experience: ${error}`)
    }

    return response.json()
  },

  /**
   * Add project
   */
  async addProject(data: {
    title: string
    description: string
    subject_id?: string
    url?: string
  }) {
    const response = await authenticatedFetch('/student/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add project: ${error}`)
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
   * Get specific student's profile
   */
  async getStudentProfile(studentId: string) {
    const response = await authenticatedFetch(`/teacher/student/${studentId}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to load student profile: ${error}`)
    }

    return response.json()
  },

  /**
   * Add comment on student
   */
  async addComment(data: {
    student_id: string
    comment: string
    category?: string
  }) {
    const response = await authenticatedFetch('/teacher/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add comment: ${error}`)
    }

    return response.json()
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