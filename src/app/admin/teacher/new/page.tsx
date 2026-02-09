'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { adminApi } from '@/lib/api'
import LogoutButton from '@/components/auth/LogoutButton'

export default function NewTeacherPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await adminApi.addTeacher(formData)
      setSuccess(true)
      setFormData({ full_name: '', email: '', password: '' })
      setTimeout(() => router.push('/admin/teacher'), 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError('Failed to add teacher: ' + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/admin/teacher')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-emerald-800">
                Add Teacher
              </h1>
              <p className="text-gray-600 mt-1">Create a new teacher account</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          {error && (
            <div className="mb-6 p-4 bg-rose-700/10 border border-rose-700/30 rounded-lg">
              <p className="text-rose-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 text-sm">
                ✓ Teacher added successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Jane Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="jane.smith@school.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Teacher can change this after first login
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/teacher')}
                className="cursor-pointer flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {loading ? 'Adding...' : 'Add Teacher'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}