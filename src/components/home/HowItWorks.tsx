"use client"

import { useRef, useEffect, useState } from "react"

const steps = [
  { title: "Take the assessment", description: "Complete our comprehensive psychometric quiz" },
  { title: "Explore career matches", description: "View ranked career recommendations based on your unique profile and your teachers' insights" },
  { title: "Build your portfolio", description: "Showcase your projects and experiences, export as PDF for applications" },
]

export default function HowItWorks() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [visible, setVisible] = useState([false, false, false])

  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible(prev => { const n = [...prev]; n[i] = true; return n })
          obs.disconnect()
        }
      }, { threshold: 0.25 })
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <section id="how-it-works" className="pt-12 pb-24 bg-white">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900 text-center">How it works</h2>
        <p className="mb-12 text-center text-gray-600">Get started in just three simple steps</p>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              ref={el => { stepRefs.current[index] = el }}
              className="flex items-start gap-6 p-6 rounded-2xl bg-linear-to-r from-violet-50/50 to-teal-50/50 border border-gray-100"
              style={{
                opacity: visible[index] ? 1 : 0,
                transform: visible[index] ? 'translateX(0)' : 'translateX(-24px)',
                transition: `opacity 0.5s ease ${index * 0.14}s, transform 0.5s ease ${index * 0.14}s`,
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
                {index + 1}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-gray-900 text-lg">{step.title}</h3>
                <p className="text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
