"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { studentApi, authApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"

// ── Types ────────────────────────────────────────────────────────────────────

interface SubjectItem {
  name: string
  category?: string
  source?: string
}

interface WorkExperienceItem {
  title: string
  organisation: string
  description?: string
  start_date?: string
  end_date?: string
  source?: string
}

interface CertificationItem {
  name: string
  issuer?: string
  date?: string
}

interface VolunteeringItem {
  title: string
  organisation: string
  description?: string
}

interface ExtracurricularItem {
  name: string
  role?: string
  description?: string
}

interface PortfolioState {
  summary: string
  year_level: string
  subjects: SubjectItem[]
  work_experience: WorkExperienceItem[]
  certifications: CertificationItem[]
  volunteering: VolunteeringItem[]
  extracurriculars: ExtracurricularItem[]
  skills: string[]
}

// ── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
  </svg>
)

const SystemBadge = () => (
  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-100 text-teal-700">
    auto
  </span>
)

// ── Component ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [portfolio, setPortfolio] = useState<PortfolioState>({
    summary: "",
    year_level: "",
    subjects: [],
    work_experience: [],
    certifications: [],
    volunteering: [],
    extracurriculars: [],
    skills: [],
  })

  const [studentName, setStudentName] = useState("")
  const [schoolName, setSchoolName] = useState("")

  // Store autofill data for reset
  const [autofill, setAutofill] = useState<{ year_level: string; subjects: SubjectItem[]; work_experience: WorkExperienceItem[] } | null>(null)

  // Inline add-form state
  const [newSkill, setNewSkill] = useState("")
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "" })
  const [newWork, setNewWork] = useState({ title: "", organisation: "", description: "", start_date: "", end_date: "" })
  const [newVolunteer, setNewVolunteer] = useState({ title: "", organisation: "", description: "" })
  const [newExtra, setNewExtra] = useState({ name: "", role: "", description: "" })

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await requireRole("student")
        const [data, profileData] = await Promise.all([
          studentApi.getPortfolio(),
          studentApi.getProfile(),
        ])
        setStudentName(profileData.profile?.full_name || "")

        try {
          const schoolData = await authApi.getSchool(userProfile)
          if (schoolData?.name) setSchoolName(schoolData.name)
        } catch { /* school fetch is optional */ }

        setAutofill(data.autofill)

        if (data.portfolio) {
          setPortfolio({
            summary: data.portfolio.summary || "",
            year_level: data.portfolio.year_level || "",
            subjects: data.portfolio.subjects || [],
            work_experience: data.portfolio.work_experience || [],
            certifications: data.portfolio.certifications || [],
            volunteering: data.portfolio.volunteering || [],
            extracurriculars: data.portfolio.extracurriculars || [],
            skills: data.portfolio.skills || [],
          })
        } else {
          const af = data.autofill
          setPortfolio({
            summary: "",
            year_level: af.year_level || "",
            subjects: (af.subjects || []).map((s: SubjectItem) => ({ ...s, source: "system" })),
            work_experience: (af.work_experience || []).map((w: WorkExperienceItem) => ({ ...w, source: "system" })),
            certifications: [],
            volunteering: [],
            extracurriculars: [],
            skills: [],
          })
        }
      } catch (err: unknown) {
        console.error("Portfolio load error:", err)
        if (err instanceof Error) {
          if (err.message.includes("Unauthorized") || err.message.includes("role")) {
            router.replace("/login")
            return
          }
          setError(err.message)
        } else {
          setError("Failed to load portfolio")
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setSaveMessage(null)
    try {
      await studentApi.savePortfolio(portfolio)
      setSaveMessage("Portfolio saved successfully!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err: unknown) {
      console.error("Save error:", err)
      setSaveMessage(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (!autofill) return
    setPortfolio({
      summary: "",
      year_level: autofill.year_level || "",
      subjects: (autofill.subjects || []).map(s => ({ ...s, source: "system" })),
      work_experience: (autofill.work_experience || []).map(w => ({ ...w, source: "system" })),
      certifications: [],
      volunteering: [],
      extracurriculars: [],
      skills: [],
    })
    setSaveMessage(null)
  }

  async function handleExportPDF() {
    setExporting(true)
    try {
      // Save first
      await studentApi.savePortfolio(portfolio)

      const html2pdf = (await import("html2pdf.js")).default
      const name = studentName || "Student"
      const school = schoolName
      const wrapper = document.createElement("div")
      wrapper.innerHTML = `
<div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 700px; margin: 0 auto; padding: 32px 36px; color: #1a1a1a; line-height: 1.55;">
  <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #064e3b;">
    <div style="font-size: 28px; font-weight: 700; color: #111; letter-spacing: -0.3px;">${name}</div>
    <div style="font-size: 13px; color: #6b7280; margin-top: 4px; font-weight: 500;">${[portfolio.year_level ? "Year " + portfolio.year_level + " Student" : "", school].filter(Boolean).join(" - ")}</div>
  </div>

  ${portfolio.summary ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Profile</div>
    <p style="font-size: 13px; color: #374151; line-height: 1.7;">${portfolio.summary}</p>
  </div>` : ""}

  ${portfolio.skills.length ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Skills</div>
    ${portfolio.skills.map(s => `<div style="font-size: 13px; color: #374151; padding: 4px 0;"><span style="color: #064e3b; margin-right: 8px; font-weight: 700;">&#8226;</span>${s}</div>`).join("")}
  </div>` : ""}

  ${portfolio.work_experience.length ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Work Experience</div>
    ${portfolio.work_experience.map(e => `<table style="border-collapse: collapse; width: 100%; margin-bottom: 14px;"><tr>
      <td style="width: 2px; background: #e5e7eb; padding: 0;"></td>
      <td style="padding: 0 0 0 12px; vertical-align: top;">
        <table style="border-collapse: collapse; width: 100%;"><tr>
          <td style="padding: 0; font-size: 14px; font-weight: 600; color: #111;">${e.title}</td>
          ${e.start_date ? `<td style="padding: 0; font-size: 12px; color: #9ca3af; white-space: nowrap; font-weight: 500; text-align: right;">${e.start_date}${e.end_date ? " - " + e.end_date : " - Present"}</td>` : ""}
        </tr></table>
        <div style="font-size: 13px; color: #6b7280; margin-top: 1px;">${e.organisation}</div>
        ${e.description ? `<div style="font-size: 12px; color: #4b5563; margin-top: 3px; line-height: 1.6;">${e.description}</div>` : ""}
      </td>
    </tr></table>`).join("")}
  </div>` : ""}

  ${portfolio.certifications.length ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Certifications</div>
    ${portfolio.certifications.map(c => `<div style="display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0;">
      <span><span style="font-size: 13px; font-weight: 600; color: #111;">${c.name}</span>${c.issuer ? ` <span style="font-size: 12px; color: #6b7280;"> - ${c.issuer}</span>` : ""}</span>
      ${c.date ? `<span style="font-size: 12px; color: #9ca3af; font-weight: 500;">${c.date}</span>` : ""}
    </div>`).join("")}
  </div>` : ""}

  ${portfolio.volunteering.length ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Volunteering</div>
    ${portfolio.volunteering.map(v => `<table style="border-collapse: collapse; width: 100%; margin-bottom: 14px;"><tr>
      <td style="width: 2px; background: #e5e7eb; padding: 0;"></td>
      <td style="padding: 0 0 0 12px; vertical-align: top;">
        <div style="font-size: 14px; font-weight: 600; color: #111;">${v.title}</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 1px;">${v.organisation}</div>
        ${v.description ? `<div style="font-size: 12px; color: #4b5563; margin-top: 3px;">${v.description}</div>` : ""}
      </td>
    </tr></table>`).join("")}
  </div>` : ""}

  ${portfolio.extracurriculars.length ? `
  <div style="margin-bottom: 32px;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Extracurricular Activities</div>
    ${portfolio.extracurriculars.map(e => `<div style="margin-bottom: 8px;">
      <span style="font-size: 13px; font-weight: 600; color: #111;">${e.name}</span>${e.role ? ` <span style="font-size: 12px; color: #6b7280;"> - ${e.role}</span>` : ""}
      ${e.description ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${e.description}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}
</div>`
      wrapper.style.position = "absolute"
      wrapper.style.left = "-9999px"
      document.body.appendChild(wrapper)

      await html2pdf().set({
        margin: [8, 4],
        filename: `${name.replace(/\s+/g, "_")}_Resume.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(wrapper.firstElementChild as HTMLElement).save()

      document.body.removeChild(wrapper)
    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setExporting(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addSkill() {
    const items = newSkill.split(/,\s*|,/).map(s => s.trim()).filter(s => s && !portfolio.skills.includes(s))
    if (items.length === 0) return
    setPortfolio(p => ({ ...p, skills: [...p.skills, ...items] }))
    setNewSkill("")
  }

  function removeSkill(index: number) {
    setPortfolio(p => ({ ...p, skills: p.skills.filter((_, i) => i !== index) }))
  }

  function addCertification() {
    if (!newCert.name.trim()) return
    const names = newCert.name.split(/,\s*|,/).map(n => n.trim()).filter(Boolean)
    const certs = names.map(n => ({ name: n, issuer: newCert.issuer.trim(), date: newCert.date.trim() }))
    setPortfolio(p => ({ ...p, certifications: [...p.certifications, ...certs] }))
    setNewCert({ name: "", issuer: "", date: "" })
  }

  function removeCertification(index: number) {
    setPortfolio(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== index) }))
  }

  function addWorkExperience() {
    if (!newWork.title.trim() || !newWork.organisation.trim()) return
    setPortfolio(p => ({ ...p, work_experience: [...p.work_experience, { ...newWork }] }))
    setNewWork({ title: "", organisation: "", description: "", start_date: "", end_date: "" })
  }

  function removeWorkExperience(index: number) {
    setPortfolio(p => ({ ...p, work_experience: p.work_experience.filter((_, i) => i !== index) }))
  }

  function addVolunteering() {
    if (!newVolunteer.title.trim() || !newVolunteer.organisation.trim()) return
    setPortfolio(p => ({ ...p, volunteering: [...p.volunteering, { ...newVolunteer }] }))
    setNewVolunteer({ title: "", organisation: "", description: "" })
  }

  function removeVolunteering(index: number) {
    setPortfolio(p => ({ ...p, volunteering: p.volunteering.filter((_, i) => i !== index) }))
  }

  function addExtracurricular() {
    if (!newExtra.name.trim()) return
    const names = newExtra.name.split(/,\s*|,/).map(n => n.trim()).filter(Boolean)
    const extras = names.map(n => ({ name: n, role: newExtra.role.trim(), description: newExtra.description.trim() }))
    setPortfolio(p => ({ ...p, extracurriculars: [...p.extracurriculars, ...extras] }))
    setNewExtra({ name: "", role: "", description: "" })
  }

  function removeExtracurricular(index: number) {
    setPortfolio(p => ({ ...p, extracurriculars: p.extracurriculars.filter((_, i) => i !== index) }))
  }

  // ── Shared button bar ──────────────────────────────────────────────────

  const buttonBar = (
    <div className="flex gap-2">
      <button
        onClick={handleReset}
        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
      >
        Reset
      </button>
      <button
        onClick={handleExportPDF}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-teal-300 text-teal-700 rounded-xl hover:bg-teal-50 transition-colors font-medium cursor-pointer disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        {exporting ? "Exporting..." : "Export as PDF"}
      </button>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 text-sm bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-linear-to-br from-violet-50 via-white to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 pb-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">My Portfolio</h1>
            <p className="text-gray-500 mt-1">Curate your resume-style profile</p>
          </div>
          {buttonBar}
        </div>

        {saveMessage && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
            saveMessage.includes("success") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Summary + Year */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">About</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Level
              {portfolio.year_level && <SystemBadge />}
            </label>
            <input
              type="text"
              value={portfolio.year_level}
              onChange={e => setPortfolio(p => ({ ...p, year_level: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="e.g. 11"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea
              value={portfolio.summary}
              onChange={e => setPortfolio(p => ({ ...p, summary: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="A short summary about yourself..."
            />
          </div>
        </div>

        {/* Skills (moved to subjects position) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
          {portfolio.skills.length > 0 && (
            <div className="space-y-3">
              {portfolio.skills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-medium text-gray-900">{skill}</h3>
                  <button onClick={() => removeSkill(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Skill name (comma-separated for multiple)"
            />
            <button
              onClick={addSkill}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <PlusIcon /> Add Skill
            </button>
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          {portfolio.work_experience.length > 0 && (
            <div className="space-y-3">
              {portfolio.work_experience.map((exp, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {exp.title}
                      {exp.source === "system" && <SystemBadge />}
                    </h3>
                    <p className="text-sm text-gray-600">{exp.organisation}</p>
                    {exp.description && <p className="text-sm text-gray-500 mt-1">{exp.description}</p>}
                    {(exp.start_date || exp.end_date) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {exp.start_date}{exp.end_date ? ` - ${exp.end_date}` : " - Present"}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeWorkExperience(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newWork.title}
                onChange={e => setNewWork(w => ({ ...w, title: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Job title"
              />
              <input
                type="text"
                value={newWork.organisation}
                onChange={e => setNewWork(w => ({ ...w, organisation: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Organisation"
              />
            </div>
            <input
              type="text"
              value={newWork.description}
              onChange={e => setNewWork(w => ({ ...w, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Description (optional)"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newWork.start_date}
                onChange={e => setNewWork(w => ({ ...w, start_date: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              <input
                type="date"
                value={newWork.end_date}
                onChange={e => setNewWork(w => ({ ...w, end_date: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={addWorkExperience}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <PlusIcon /> Add Experience
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
          {portfolio.certifications.length > 0 && (
            <div className="space-y-3">
              {portfolio.certifications.map((cert, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
                    {cert.date && <p className="text-xs text-gray-400 mt-1">{cert.date}</p>}
                  </div>
                  <button onClick={() => removeCertification(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newCert.name}
                onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Certification name (comma-separated for multiple)"
              />
              <input
                type="text"
                value={newCert.issuer}
                onChange={e => setNewCert(c => ({ ...c, issuer: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Issuing organisation (optional)"
              />
            </div>
            <input
              type="text"
              value={newCert.date}
              onChange={e => setNewCert(c => ({ ...c, date: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Date (optional, e.g. 2025)"
            />
            <button
              onClick={addCertification}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <PlusIcon /> Add Certification
            </button>
          </div>
        </div>

        {/* Volunteering */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Volunteering</h2>
          {portfolio.volunteering.length > 0 && (
            <div className="space-y-3">
              {portfolio.volunteering.map((vol, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">{vol.title}</h3>
                    <p className="text-sm text-gray-600">{vol.organisation}</p>
                    {vol.description && <p className="text-sm text-gray-500 mt-1">{vol.description}</p>}
                  </div>
                  <button onClick={() => removeVolunteering(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newVolunteer.title}
                onChange={e => setNewVolunteer(v => ({ ...v, title: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Role / title"
              />
              <input
                type="text"
                value={newVolunteer.organisation}
                onChange={e => setNewVolunteer(v => ({ ...v, organisation: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Organisation"
              />
            </div>
            <input
              type="text"
              value={newVolunteer.description}
              onChange={e => setNewVolunteer(v => ({ ...v, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Description (optional)"
            />
            <button
              onClick={addVolunteering}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <PlusIcon /> Add Volunteering
            </button>
          </div>
        </div>

        {/* Extracurriculars */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Extracurriculars</h2>
          {portfolio.extracurriculars.length > 0 && (
            <div className="space-y-3">
              {portfolio.extracurriculars.map((ec, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">{ec.name}</h3>
                    {ec.role && <p className="text-sm text-gray-600">{ec.role}</p>}
                    {ec.description && <p className="text-sm text-gray-500 mt-1">{ec.description}</p>}
                  </div>
                  <button onClick={() => removeExtracurricular(i)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newExtra.name}
                onChange={e => setNewExtra(x => ({ ...x, name: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Activity name (comma-separated for multiple)"
              />
              <input
                type="text"
                value={newExtra.role}
                onChange={e => setNewExtra(x => ({ ...x, role: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Your role (optional)"
              />
            </div>
            <input
              type="text"
              value={newExtra.description}
              onChange={e => setNewExtra(x => ({ ...x, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Description (optional)"
            />
            <button
              onClick={addExtracurricular}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <PlusIcon /> Add Extracurricular
            </button>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-end">
          {buttonBar}
        </div>
      </div>
    </div>
  )
}
