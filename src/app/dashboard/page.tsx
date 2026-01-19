"use client"

import DashboardLayout from "@/components/dashboard/DashboardLayout"
import LogoutButton from "@/components/auth/LogoutButton"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold">
        Welcome to your dashboard
      </h2>

      <p className="mt-4 text-gray-600">
        This is where your career insights will live.
      </p>
    </DashboardLayout>
  )
}
