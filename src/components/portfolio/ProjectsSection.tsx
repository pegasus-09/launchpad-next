"use client"

import { useState } from "react"

export type Project = {
    id: string
    title: string
    description: string
    technologies?: string[]
    link?: string
}

type Props = {
    projects: Project[]
    onChange: (projects: Project[]) => void
}

export default function ProjectsSection({ projects, onChange }: Props) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [technologies, setTechnologies] = useState("")

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editTechnologies, setEditTechnologies] = useState("")

    function addProject() {
        if (!title.trim() || !description.trim()) {
            return
        }

        const newProject: Project = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            technologies: technologies
                ? technologies
                      .split(",")
                      .map(t => t.trim())
                      .filter(Boolean)
                : []
        }

        onChange([...projects, newProject])

        setTitle("")
        setDescription("")
        setTechnologies("")
    }

    function removeProject(id: string) {
        onChange(projects.filter(p => p.id !== id))
    }

    function startEditing(project: Project) {
        setEditingId(project.id)
        setEditTitle(project.title)
        setEditDescription(project.description)
        setEditTechnologies(project.technologies?.join(", ") ?? "")
    }

    function cancelEditing() {
        setEditingId(null)
        setEditTitle("")
        setEditDescription("")
        setEditTechnologies("")
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
                      technologies: editTechnologies
                          ? editTechnologies
                                .split(",")
                                .map(t => t.trim())
                                .filter(Boolean)
                          : []
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

    return (
        <section className="space-y-6">
            <h2 className="text-lg font-medium">
                Projects
            </h2>

            {/* Add project */}
            <div className="space-y-3 rounded-md border border-gray-200 p-4">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Project title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Short description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Technologies (comma separated)"
                    value={technologies}
                    onChange={e => setTechnologies(e.target.value)}
                />

                <button
                    onClick={addProject}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Add project
                </button>
            </div>

            {!projects.length && (
                <p className="text-sm text-muted-foreground">
                    No projects added yet.
                </p>
            )}

            <ul className="space-y-3">
                {projects.map((project, index) => {
                    const isEditing = editingId === project.id

                    return (
                        <li
                            key={project.id}
                            className="rounded-md border border-gray-200 p-4 space-y-2"
                        >
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                    />

                                    <textarea
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        rows={3}
                                        value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                    />

                                    <input
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        value={editTechnologies}
                                        onChange={e => setEditTechnologies(e.target.value)}
                                    />

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
                                    <div>
                                        <h3 className="font-semibold">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {project.description}
                                        </p>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {project.technologies.join(" · ")}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
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