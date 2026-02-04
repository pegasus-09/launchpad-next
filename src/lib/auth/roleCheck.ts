// src/lib/auth/roleCheck.ts
// Role-based route protection utilities

import { createClient } from '@/lib/supabase/client'

export type UserRole = 'student' | 'teacher' | 'admin'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  email: string
  school_id: string
  year_level?: string
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  )
}

/**
 * Get current user's profile with role
 * Returns null if not authenticated
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session ?? null
  } catch (error) {
    if (isAbortError(error)) {
      return null
    }
    console.error('Failed to get session:', error)
    return null
  }

  if (!session) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, email, school_id, year_level')
      .eq('id', session.user.id)
      .single()

    if (error || !data) {
      console.error('Failed to load profile:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    if (isAbortError(error)) {
      return null
    }
    console.error('Failed to load profile:', error)
    return null
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    throw new Error('Not authenticated')
  }
  
  return profile
}

/**
 * Require specific role - redirect if wrong role
 */
export async function requireRole(allowedRoles: UserRole | UserRole[]): Promise<UserProfile> {
  const profile = await requireAuth()
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!roles.includes(profile.role)) {
    throw new Error('Unauthorized')
  }
  
  return profile
}

/**
 * Get dashboard URL for a role
 */
export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'student':
      return '/student/'
    case 'teacher':
      return '/teacher/'
    case 'admin':
      return '/admin/'
    default:
      return '/redirect'
  }
}

/**
 * Check if user has permission for a role
 */
export async function hasRole(allowedRoles: UserRole | UserRole[]): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  if (!profile) return false
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(profile.role)
}
