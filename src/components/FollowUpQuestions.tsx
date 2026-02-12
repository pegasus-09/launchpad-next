"use client"

import { useState } from "react"

export interface FollowUpQuestion {
  id: string
  text: string
  type: "choice" | "scale" | "scenario" | "freetext"
  options: string[]
  targets: string[]
}

export interface FollowUpAnswer {
  id: string
  question: string
  answer: string
}

interface Props {
  questions: FollowUpQuestion[]
  onComplete: (answers: FollowUpAnswer[]) => void
}

export default function FollowUpQuestions({ questions, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const allAnswered = questions.every((q) => answers[q.id]?.trim())

  function handleSelect(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleSubmit() {
    if (!allAnswered) return
    const result: FollowUpAnswer[] = questions.map((q) => ({
      id: q.id,
      question: q.text,
      answer: answers[q.id],
    }))
    onComplete(result)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium mb-4">
            Step 2 of 2
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Just a few more questions...
          </h1>
          <p className="text-gray-600">
            Your initial answers were quite similar across categories. These follow-up
            questions will help us understand your preferences better and give you
            more personalised career guidance.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-xs text-gray-500">
            <span>Question 1</span>
            <span>Question {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-linear-to-r from-violet-500 to-teal-500 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).filter((k) => answers[k]?.trim()).length / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, idx) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <p className="text-gray-900 font-medium mb-4">
                <span className="text-violet-500 font-semibold mr-2">
                  {idx + 1}.
                </span>
                {question.text}
              </p>

              {/* Choice / Scenario type → card-style radio buttons */}
              {(question.type === "choice" || question.type === "scenario") && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(question.id, option)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-sm ${
                        answers[question.id] === option
                          ? "border-violet-500 bg-violet-50 text-violet-900 font-medium"
                          : "border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Scale type → 1-5 buttons */}
              {question.type === "scale" && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-gray-400">Strongly Disagree</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          handleSelect(question.id, String(value))
                        }
                        className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer text-sm font-medium ${
                          answers[question.id] === String(value)
                            ? "border-violet-600 bg-violet-600 text-white shadow-md"
                            : "border-gray-300 text-gray-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Strongly Agree</span>
                </div>
              )}

              {/* Free text type */}
              {question.type === "freetext" && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleSelect(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none text-sm text-gray-700 resize-none transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
          >
            Get My Results
          </button>
        </div>
      </div>
    </div>
  )
}
