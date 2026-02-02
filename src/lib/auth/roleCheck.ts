// src/lib/auth/roleCheck.ts
// Role-based route protection utilities

import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'

export type UserRole = 'student' | 'teacher' | 'admin'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  email: string
  school_id: string
  year_level?: string
}

/**
 * Get current user's profile with role
 * Returns null if not authenticated
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

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
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect('/login')
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
    // Redirect to appropriate dashboard based on actual role
    redirect(getRoleDashboard(profile.role))
  }
  
  return profile
}

/**
 * Get dashboard URL for a role
 */
export function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'student':
      return '/dashboard'
    case 'teacher':
      return '/teacher/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/dashboard'
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
