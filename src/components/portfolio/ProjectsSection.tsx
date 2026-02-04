"use client"

import { useState } from "react"

export type Project = {
    id: string
    title: string
    description: string
    skills?: string[]
    startDate?: { month: number; year: number }
    endDate?: { month: number; year: number } | 'present'
    link?: string
}

type Props = {
    projects: Project[]
    onChange: (projects: Project[]) => void
}

export default function ProjectsSection({ projects, onChange }: Props) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [skills, setSkills] = useState("")
    const [startMonth, setStartMonth] = useState("")
    const [startYear, setStartYear] = useState("")
    const [endMonth, setEndMonth] = useState("")
    const [endYear, setEndYear] = useState("")
    const [isPresent, setIsPresent] = useState(false)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editSkills, setEditSkills] = useState("")
    const [editStartMonth, setEditStartMonth] = useState("")
    const [editStartYear, setEditStartYear] = useState("")
    const [editEndMonth, setEditEndMonth] = useState("")
    const [editEndYear, setEditEndYear] = useState("")
    const [editIsPresent, setEditIsPresent] = useState(false)

    function addProject() {
        if (!title.trim() || !description.trim()) {
            return
        }

        const newProject: Project = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            skills: skills
                ? skills
                      .split(",")
                      .map(t => t.trim())
                      .filter(Boolean)
                : [],
            startDate: startMonth && startYear 
                ? { month: parseInt(startMonth), year: parseInt(startYear) }
                : undefined,
            endDate: isPresent 
                ? 'present'
                : (endMonth && endYear 
                    ? { month: parseInt(endMonth), year: parseInt(endYear) }
                    : undefined)
        }

        onChange([...projects, newProject])

        setTitle("")
        setDescription("")
        setSkills("")
        setStartMonth("")
        setStartYear("")
        setEndMonth("")
        setEndYear("")
        setIsPresent(false)
    }

    function removeProject(id: string) {
        onChange(projects.filter(p => p.id !== id))
    }

    function startEditing(project: Project) {
        setEditingId(project.id)
        setEditTitle(project.title)
        setEditDescription(project.description)
        setEditSkills(project.skills?.join(", ") ?? "")
        setEditStartMonth(project.startDate?.month.toString() ?? "")
        setEditStartYear(project.startDate?.year.toString() ?? "")
        if (project.endDate === 'present') {
            setEditIsPresent(true)
            setEditEndMonth("")
            setEditEndYear("")
        } else {
            setEditIsPresent(false)
            setEditEndMonth(project.endDate?.month.toString() ?? "")
            setEditEndYear(project.endDate?.year.toString() ?? "")
        }
    }

    function cancelEditing() {
        setEditingId(null)
        setEditTitle("")
        setEditDescription("")
        setEditSkills("")
        setEditStartMonth("")
        setEditStartYear("")
        setEditEndMonth("")
        setEditEndYear("")
        setEditIsPresent(false)
    }

    function saveEditing(id: string) {
        if (!editTitle.trim() || !editDescription.trim()) {
            return
        }

        const updatedProjects = projects.map(p =>
            p.id === id
                ? {
                      ...p,
                      title: editTitle.trim(),
                      description: editDescription.trim(),
                      skills: editSkills
                          ? editSkills
                                .split(",")
                                .map(t => t.trim())
                                .filter(Boolean)
                          : [],
                      startDate: editStartMonth && editStartYear
                          ? { month: parseInt(editStartMonth), year: parseInt(editStartYear) }
                          : undefined,
                      endDate: editIsPresent
                          ? 'present' as const
                          : (editEndMonth && editEndYear
                              ? { month: parseInt(editEndMonth), year: parseInt(editEndYear) }
                              : undefined)
                  }
                : p
        )

        onChange(updatedProjects)
        cancelEditing()
    }

    function moveProject(index: number, direction: "up" | "down") {
        const targetIndex = direction === "up" ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= projects.length) {
            return
        }

        const updated = [...projects]
        const temp = updated[index]
        updated[index] = updated[targetIndex]
        updated[targetIndex] = temp

        onChange(updated)
    }

    function formatDate(date: { month: number; year: number } | 'present' | undefined): string {
        if (!date) return ""
        if (date === 'present') return "Present"
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${months[date.month - 1]} ${date.year}`
    }

    const monthOptions = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ]

    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i)

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-medium mb-2">
                    Projects
                </h2>
                <p className="text-sm text-gray-600">
                    Add 1 or more projects that showcase your abilities and interests. Include personal projects, 
                    coursework, competitions, or anything you&apos;ve built.
                </p>
            </div>

            {/* Add project */}
            <div className="space-y-3 rounded-md border border-gray-200 p-4 bg-gray-50">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Project title (e.g., 'Personal Finance Tracker')"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Brief description of what you built and why (2-3 sentences)"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Skills used (comma separated, e.g., Python, React, Data Analysis)"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <div className="flex gap-2">
                        <select
                            value={startMonth}
                            onChange={e => setStartMonth(e.target.value)}
                            className="flex-1 rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Month</option>
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <select
                            value={startYear}
                            onChange={e => setStartYear(e.target.value)}
                            className="flex-1 rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Year</option>
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={e => setIsPresent(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-600">Ongoing project</span>
                    </div>
                    {!isPresent && (
                        <div className="flex gap-2">
                            <select
                                value={endMonth}
                                onChange={e => setEndMonth(e.target.value)}
                                className="flex-1 rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Month</option>
                                {monthOptions.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <select
                                value={endYear}
                                onChange={e => setEndYear(e.target.value)}
                                className="flex-1 rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">Year</option>
                                {yearOptions.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button
                    onClick={addProject}
                    className="rounded-md cursor-pointer bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Add project
                </button>
            </div>

            {!projects.length && (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-sm text-gray-500">
                        No projects added yet. Start by adding your first project above.
                    </p>
                </div>
            )}

            <ul className="space-y-3">
                {projects.map((project, index) => {
                    const isEditing = editingId === project.id

                    return (
                        <li
                            key={project.id}
                            className="rounded-md border border-gray-200 p-4 space-y-2 bg-white"
                        >
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        placeholder="Project title"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                    />

                                    <textarea
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        placeholder="Description"
                                        rows={3}
                                        value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                    />

                                    <input
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        placeholder="Skills (comma separated)"
                                        value={editSkills}
                                        onChange={e => setEditSkills(e.target.value)}
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={editStartMonth}
                                                onChange={e => setEditStartMonth(e.target.value)}
                                                className="flex-1 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="">Month</option>
                                                {monthOptions.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={editStartYear}
                                                onChange={e => setEditStartYear(e.target.value)}
                                                className="flex-1 rounded-md border px-3 py-2 text-sm"
                                            >
                                                <option value="">Year</option>
                                                {yearOptions.map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">End Date</label>
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={editIsPresent}
                                                onChange={e => setEditIsPresent(e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-gray-600">Ongoing project</span>
                                        </div>
                                        {!editIsPresent && (
                                            <div className="flex gap-2">
                                                <select
                                                    value={editEndMonth}
                                                    onChange={e => setEditEndMonth(e.target.value)}
                                                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <option value="">Month</option>
                                                    {monthOptions.map(m => (
                                                        <option key={m.value} value={m.value}>{m.label}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={editEndYear}
                                                    onChange={e => setEditEndYear(e.target.value)}
                                                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <option value="">Year</option>
                                                    {yearOptions.map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => saveEditing(project.id)}
                                            className="text-sm font-medium text-green-600 hover:underline cursor-pointer"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="text-sm text-muted-foreground hover:underline cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                {project.title}
                                            </h3>
                                            {(project.startDate || project.endDate) && (
                                                <span className="text-xs text-gray-500 font-medium">
                                                    • {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {project.description}
                                        </p>
                                        {project.skills && project.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {project.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 ml-4">
                                        <button
                                            onClick={() => moveProject(index, "up")}
                                            disabled={index === 0}
                                            className="text-sm text-gray-500 hover:underline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            onClick={() => moveProject(index, "down")}
                                            disabled={index === projects.length - 1}
                                            className="text-sm text-gray-500 hover:underline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            onClick={() => startEditing(project)}
                                            className="text-sm text-gray-600 hover:underline cursor-pointer"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => removeProject(project.id)}
                                            className="text-sm text-red-500 hover:underline cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
