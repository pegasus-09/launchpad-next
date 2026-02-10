"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, ReactNode } from "react";

const DIMENSION_LABELS: Record<string, string> = {
  A1: "Verbal Reasoning", A2: "Numerical Reasoning", A3: "Spatial Awareness",
  A4: "Mechanical Reasoning", A5: "Abstract Thinking",
  I1: "Realistic", I2: "Investigative", I3: "Artistic",
  I4: "Social", I5: "Enterprising", I6: "Conventional",
  T1: "Conscientiousness", T2: "Emotional Stability", T3: "Agreeableness",
  T4: "Openness", T5: "Extraversion", T6: "Resilience",
  V1: "Achievement", V2: "Independence", V3: "Recognition",
  V4: "Relationships", V5: "Support", V6: "Working Conditions",
  W1: "Attention to Detail", W2: "Leadership", W3: "Cooperation", W4: "Innovation",
};

const CATEGORIES: Record<string, string[]> = {
  "Aptitudes (A1-A5)": ["A1","A2","A3","A4","A5"],
  "Interests (I1-I6)": ["I1","I2","I3","I4","I5","I6"],
  "Traits (T1-T6)": ["T1","T2","T3","T4","T5","T6"],
  "Values (V1-V6)": ["V1","V2","V3","V4","V5","V6"],
  "Work Styles (W1-W4)": ["W1","W2","W3","W4"],
};

const PRESETS = {
  "All 5s (Flat)": Object.fromEntries(Object.keys(DIMENSION_LABELS).map(k => [k, 5])),
  "STEM Student": {
    A1:3,A2:5,A3:4,A4:5,A5:5, I1:4,I2:5,I3:1,I4:2,I5:3,I6:3,
    T1:4,T2:4,T3:2,T4:5,T5:2,T6:4, V1:5,V2:4,V3:2,V4:2,V5:2,V6:3,
    W1:5,W2:3,W3:2,W4:5,
  },
  "Creative Student": {
    A1:4,A2:2,A3:4,A4:1,A5:3, I1:2,I2:3,I3:5,I4:4,I5:3,I6:1,
    T1:2,T2:3,T3:4,T4:5,T5:4,T6:3, V1:3,V2:5,V3:4,V4:3,V5:2,V6:2,
    W1:2,W2:2,W3:3,W4:5,
  },
  "Balanced / Ambiguous": {
    A1:3,A2:3,A3:3,A4:3,A5:3, I1:3,I2:3,I3:3,I4:3,I5:3,I6:3,
    T1:3,T2:3,T3:3,T4:3,T5:3,T6:3, V1:3,V2:3,V3:3,V4:3,V5:3,V6:3,
    W1:3,W2:3,W3:3,W4:3,
  },
};

const SAMPLE_COMMENTS = [
  {
    label: "STEM Teacher (Mrs Patterson)",
    teacher_name: "Mrs Patterson",
    subject_name: "Mathematics",
    performance_rating: 4,
    engagement_rating: 3,
    comment_text: "Alice is a strong analytical thinker who consistently performs well on problem-solving tasks. She picks up new concepts quickly, particularly in the statistics and probability units. Her written work is always well-organised and she often helps classmates who are struggling. That said, Alice can be reluctant to participate in group discussions and tends to work independently even during collaborative tasks. Her written explanations could be more detailed — she often arrives at the correct answer but doesn't show her working clearly. She's expressed interest in the school's coding club and I'd recommend she consider Extension 1 Maths for Year 11.",
  },
  {
    label: "English Teacher (Mr Okafor)",
    teacher_name: "Mr Okafor",
    subject_name: "English",
    performance_rating: 2,
    engagement_rating: 4,
    comment_text: "Jordan is one of the most creative students in the class. His creative writing pieces are genuinely impressive — vivid imagery, strong voice, and a real sense of storytelling. He gets very animated during class discussions about texts and always has an interesting perspective to share. The issue is with the more structured work. Essay writing is a real challenge for him. He struggles to organise his arguments logically and often misses deadlines. His spelling and grammar need consistent attention. I've spoken to him about time management a few times but it hasn't really stuck yet. He mentioned he's been writing a short film script outside of school which is great to see. I think he'd do well in a pathway that lets him use his imagination rather than one that's heavily academic.",
  },
  {
    label: "Science Teacher (Ms Nguyen)",
    teacher_name: "Ms Nguyen",
    subject_name: "Science",
    performance_rating: 3,
    engagement_rating: 2,
    comment_text: "Priya is a steady student who does what's asked of her but rarely goes beyond that. Her lab reports are competent and she grasps the content without too much difficulty. She's quiet in class and I honestly find it hard to tell whether she's genuinely interested or just going through the motions. She doesn't volunteer answers or ask questions. In group pracs she tends to let others take the lead and does whatever she's assigned without complaint. Her marks are consistently in the B range — nothing concerning but nothing that stands out either. I don't have a strong read on what she'd want to do after school. She did seem more engaged during the environmental science unit than usual, which might be worth noting.",
  },
];

const DEFAULT_SUBJECTS = [
  { subject_name: "Mathematics", year_level: "10", grade: "" },
  { subject_name: "English", year_level: "10", grade: "" },
  { subject_name: "Science", year_level: "10", grade: "" },
];

// ── Colour-coded score button styles ────────────────────────────
// Inlined to ensure Tailwind JIT scanner detects every class.

function scoreButtonClass(v: number, selected: boolean): string {
  if (selected) {
    if (v === 1) return "border-red-500 bg-red-500 text-white shadow-md";
    if (v === 2) return "border-orange-500 bg-orange-500 text-white shadow-md";
    if (v === 3) return "border-amber-500 bg-amber-500 text-white shadow-md";
    if (v === 4) return "border-teal-500 bg-teal-500 text-white shadow-md";
    return "border-violet-600 bg-violet-600 text-white shadow-md";
  }
  if (v === 1) return "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50";
  if (v === 2) return "border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50";
  if (v === 3) return "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50";
  if (v === 4) return "border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50";
  return "border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50";
}

// ── Reusable Components ─────────────────────────────────────────

function Badge({ children, color = "violet" }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    emerald: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
    </div>
  );
}

// ── Score Input (Colour-coded Likert Scale) ─────────────────────

function ScoreInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (id: string, val: number) => void }) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <span className="text-xs font-mono text-gray-400 w-8">{id}</span>
      <span className="text-sm text-gray-700 w-48 truncate">{label}</span>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(v => (
          <button
            key={v}
            onClick={() => onChange(id, v)}
            className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer text-sm font-semibold ${scoreButtonClass(v, value === v)}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Teacher Comment Form ────────────────────────────────────────

function CommentForm({ comment, index, onChange, onRemove }: { comment: any; index: number; onChange: (i: number, c: any) => void; onRemove: (i: number) => void }) {
  const update = (field: string, value: any) => onChange(index, { ...comment, [field]: value });
  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-5 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-semibold text-gray-800">Comment #{index + 1}</span>
        <button onClick={() => onRemove(index)} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium">
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <input
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
          placeholder="Teacher name"
          value={comment.teacher_name}
          onChange={e => update("teacher_name", e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
          placeholder="Subject"
          value={comment.subject_name}
          onChange={e => update("subject_name", e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Performance</label>
          <select
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none cursor-pointer"
            value={comment.performance_rating}
            onChange={e => update("performance_rating", +e.target.value)}
          >
            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}/5</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Engagement</label>
          <select
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none cursor-pointer"
            value={comment.engagement_rating}
            onChange={e => update("engagement_rating", +e.target.value)}
          >
            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}/5</option>)}
          </select>
        </div>
      </div>
      <textarea
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors min-h-35 resize-y"
        placeholder="Teacher's comment..."
        value={comment.comment_text}
        onChange={e => update("comment_text", e.target.value)}
      />
    </div>
  );
}

// ── Results Display ─────────────────────────────────────────────

function ResultsPanel({ data }: { data: any }) {
  const [showRaw, setShowRaw] = useState(false);

  if (data.error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <p className="text-red-800 font-semibold text-lg">Analysis failed</p>
        <p className="text-sm text-red-600 mt-2">{data.error}</p>
      </Card>
    );
  }

  const confidenceColor = (data.confidence_score || 0) >= 0.7 ? "emerald" : (data.confidence_score || 0) >= 0.4 ? "amber" : "red";

  return (
    <div className="space-y-8">
      {/* Confidence + Weighting */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <SectionTitle subtitle="How the AI weighted the evidence">Data Weighting</SectionTitle>
          <Badge color={confidenceColor}>Confidence: {((data.confidence_score || 0) * 100).toFixed(0)}%</Badge>
        </div>
        {data.data_weighting && (
          <div className="space-y-4">
            <div className="flex items-center gap-5 text-sm">
              <span className="text-gray-500 w-40">Assessment weight</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3.5 overflow-hidden">
                <div className="bg-linear-to-r from-violet-500 to-violet-400 h-full rounded-full transition-all duration-300" style={{ width: `${(data.data_weighting.assessment_weight || 0) * 100}%` }} />
              </div>
              <span className="text-gray-800 font-semibold w-14 text-right">{((data.data_weighting.assessment_weight || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <span className="text-gray-500 w-40">Teacher weight</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3.5 overflow-hidden">
                <div className="bg-linear-to-r from-teal-500 to-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${(data.data_weighting.teacher_weight || 0) * 100}%` }} />
              </div>
              <span className="text-gray-800 font-semibold w-14 text-right">{((data.data_weighting.teacher_weight || 0) * 100).toFixed(0)}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic border-l-2 border-violet-200 pl-4">{data.data_weighting.reasoning}</p>
          </div>
        )}
        {data.confidence_explanation && (
          <p className="text-xs text-gray-400 mt-5">{data.confidence_explanation}</p>
        )}
      </Card>

      {/* Final Ranking */}
      <Card className="p-8">
        <SectionTitle subtitle="AI-ranked based on all available evidence">Top 5 Career Recommendations</SectionTitle>
        <div className="space-y-5">
          {(data.final_ranking || []).map((career: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-violet-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-5">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-violet-500 to-teal-500 text-white text-sm font-bold shadow-md shrink-0">
                    {career.rank || i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{career.career_name}</h3>
                    <span className="text-xs text-gray-400 font-mono">{career.soc_code}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {career.from_deterministic_top20 === false && <Badge color="amber">AI Injected</Badge>}
                  {career.original_position && career.rank !== career.original_position && (
                    <Badge color="teal">Moved from #{career.original_position}</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{career.reasoning}</p>
              {career.key_evidence && (
                <div className="flex flex-wrap gap-2">
                  {career.key_evidence.map((ev: any, j: number) => (
                    <span key={j} className="text-xs bg-violet-50 text-violet-600 px-3 py-1.5 rounded-full border border-violet-100 font-medium">{ev}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths */}
      <Card className="p-8">
        <SectionTitle subtitle="Based on assessment scores and teacher observations">Strength Profile</SectionTitle>
        <div className="space-y-4">
          {(data.strength_profile || []).map((s: any, i: number) => (
            <div key={i} className="flex gap-5 items-start p-5 bg-green-50 rounded-xl border border-green-100">
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-sm font-semibold text-gray-800">{s.strength}</span>
                  <Badge color={s.confidence === "high" ? "emerald" : "amber"}>{s.confidence}</Badge>
                  <Badge color="gray">{s.source}</Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.evidence}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Gaps */}
      <Card className="p-8">
        <SectionTitle subtitle="Areas for growth with actionable suggestions">Growth Opportunities</SectionTitle>
        <div className="space-y-4">
          {(data.gap_analysis || []).map((g: any, i: number) => (
            <div key={i} className={`flex gap-5 items-start p-5 rounded-xl border ${g.severity === "significant" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
              <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${g.severity === "significant" ? "bg-red-500" : "bg-amber-500"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-sm font-semibold text-gray-800">{g.area}</span>
                  <Badge color={g.severity === "significant" ? "red" : "amber"}>{g.severity}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{g.evidence}</p>
                {g.growth_suggestion && (
                  <p className="text-sm text-teal-700 italic border-l-2 border-teal-300 pl-4">{g.growth_suggestion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Conflicts */}
      {data.conflicts && data.conflicts.length > 0 && (
        <Card className="p-8 border-amber-200">
          <SectionTitle subtitle="Where your self-assessment and teacher observations differ">Interesting Discrepancies</SectionTitle>
          <div className="space-y-5">
            {data.conflicts.map((c: any, i: number) => (
              <div key={i} className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                <p className="font-semibold text-amber-800 mb-4">{c.dimension}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-4 border border-amber-100">
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Your assessment</span>
                    <p className="text-sm text-gray-800 mt-2 font-medium">{c.assessment_says}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-amber-100">
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Teacher says</span>
                    <p className="text-sm text-gray-800 mt-2 font-medium">{c.teacher_says}</p>
                  </div>
                </div>
                <p className="text-sm text-amber-700 italic border-l-2 border-amber-300 pl-4">{c.ai_interpretation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overall Narrative */}
      {data.overall_narrative && (
        <Card className="p-8 bg-linear-to-br from-violet-50 via-white to-teal-50 border-violet-200">
          <SectionTitle>Your Career Profile Summary</SectionTitle>
          <p className="text-gray-700 leading-relaxed text-base">{data.overall_narrative}</p>
        </Card>
      )}

      {/* Raw JSON Toggle */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors font-medium"
        >
          {showRaw ? "Hide" : "Show"} raw JSON response
        </button>
        {showRaw && (
          <pre className="mt-4 p-6 bg-gray-900 text-green-400 rounded-2xl text-xs overflow-auto max-h-96 text-left">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function AnalysisTestPage() {
  const [answers, setAnswers] = useState<Record<string, number>>(PRESETS["STEM Student"]);
  const [comments, setComments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([...DEFAULT_SUBJECTS]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");

  const setPreset = (name: string) => setAnswers({ ...(PRESETS as any)[name] });
  const setScore = (id: string, val: number) => setAnswers(prev => ({ ...prev, [id]: val }));

  const addComment = () => {
    setComments(prev => [...prev, { teacher_name: "", subject_name: "", performance_rating: 3, engagement_rating: 3, comment_text: "" }]);
  };
  const updateComment = (i: number, c: any) => setComments(prev => prev.map((x: any, j: number) => j === i ? c : x));
  const removeComment = (i: number) => setComments(prev => prev.filter((_: any, j: number) => j !== i));
  const loadSampleComment = (sample: any) => {
    setComments(prev => [...prev, { ...sample }]);
  };

  const addSubject = () => setSubjects(prev => [...prev, { subject_name: "", year_level: "10", grade: "" }]);
  const updateSubject = (i: number, field: string, val: string) => setSubjects(prev => prev.map((s: any, j: number) => j === i ? { ...s, [field]: val } : s));
  const removeSubject = (i: number) => setSubjects(prev => prev.filter((_: any, j: number) => j !== i));

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${apiUrl}/test/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          teacher_comments: comments.filter(c => c.comment_text.trim()),
          subject_enrolments: subjects.filter(s => s.subject_name.trim()),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  }, [answers, comments, subjects, apiUrl]);

  // Quality check preview
  const values = Object.values(answers);
  const allSame = new Set(values).size === 1;
  const mostCommon = Math.max(...(Object.values(values.reduce((a: any, v: any) => ({ ...a, [v]: (a[v]||0)+1 }), {} as any)) as number[]));
  const straightLineRatio = mostCommon / values.length;

  const qualityInfo = allSame
    ? { label: "Invalid — all identical", color: "bg-red-50 text-red-700 border-red-200" }
    : straightLineRatio > 0.8
    ? { label: "Low confidence — straight-lining detected", color: "bg-amber-50 text-amber-700 border-amber-200" }
    : new Set(values).size <= 2
    ? { label: "Medium confidence — limited differentiation", color: "bg-amber-50 text-amber-700 border-amber-200" }
    : { label: "High confidence", color: "bg-green-50 text-green-700 border-green-200" };

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-10 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Analysis Test Console</h1>
              <p className="text-gray-500 mt-2">Test the full AI career analysis pipeline with custom inputs</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3 border border-gray-200">
              <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Backend URL</label>
              <input
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none w-56"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-10 py-10 space-y-8">
        {/* Assessment Scores */}
        <Card className="p-8">
          <SectionTitle subtitle="27 questions, scale 1-5. Use presets for quick testing.">Assessment Scores</SectionTitle>

          {/* Presets */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {Object.keys(PRESETS).map(name => (
              <button
                key={name}
                onClick={() => setPreset(name)}
                className="px-5 py-2.5 text-sm font-medium border border-violet-200 text-violet-700 rounded-xl hover:bg-violet-50 cursor-pointer transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          {/* Quality indicator */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium border mb-6 ${qualityInfo.color}`}>
            {qualityInfo.label}
          </div>

          {/* Colour legend */}
          <div className="flex items-center gap-5 mb-6 text-xs text-gray-400">
            <span>Score key:</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> 1</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /> 2</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> 3</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-teal-500" /> 4</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-600" /> 5</span>
          </div>

          {/* Score grid */}
          <div className="space-y-8">
            {Object.entries(CATEGORIES).map(([cat, ids]) => (
              <div key={cat} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{cat}</h3>
                <div className="space-y-1">
                  {ids.map(id => (
                    <ScoreInput key={id} id={id} label={DIMENSION_LABELS[id]} value={answers[id]} onChange={setScore} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Teacher Comments */}
        <Card className="p-8">
          <SectionTitle subtitle="Add teacher comments to see how AI integrates them. Use samples for quick testing.">Teacher Comments</SectionTitle>
          <div className="flex gap-3 mb-6 flex-wrap">
            {SAMPLE_COMMENTS.map((s: any, i: number) => (
              <button
                key={i}
                onClick={() => loadSampleComment(s)}
                className="px-5 py-2.5 text-sm font-medium border border-teal-200 text-teal-700 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors"
              >
                + {s.label}
              </button>
            ))}
          </div>
          {comments.map((c: any, i: number) => (
            <CommentForm key={i} comment={c} index={i} onChange={updateComment} onRemove={removeComment} />
          ))}
          <button
            onClick={addComment}
            className="text-sm text-violet-600 hover:text-violet-700 cursor-pointer font-medium hover:bg-violet-50 px-4 py-2 rounded-lg transition-colors"
          >
            + Add blank comment
          </button>
        </Card>

        {/* Subjects */}
        <Card className="p-8">
          <SectionTitle subtitle="Student's subject enrolments">Subjects</SectionTitle>
          <div className="space-y-4">
            {subjects.map((s: any, i: number) => (
              <div key={i} className="flex gap-4 items-center">
                <input
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="Subject name"
                  value={s.subject_name}
                  onChange={e => updateSubject(i, "subject_name", e.target.value)}
                />
                <input
                  className="w-24 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-center"
                  placeholder="Year"
                  value={s.year_level}
                  onChange={e => updateSubject(i, "year_level", e.target.value)}
                />
                <input
                  className="w-24 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-center"
                  placeholder="Grade"
                  value={s.grade}
                  onChange={e => updateSubject(i, "grade", e.target.value)}
                />
                <button
                  onClick={() => removeSubject(i)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors text-lg"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSubject}
            className="text-sm text-violet-600 hover:text-violet-700 cursor-pointer font-medium mt-4 hover:bg-violet-50 px-4 py-2 rounded-lg transition-colors"
          >
            + Add subject
          </button>
        </Card>

        {/* Run Button */}
        <button
          onClick={runAnalysis}
          disabled={loading}
          className={`w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            loading
              ? "bg-gray-400"
              : "bg-violet-600 hover:bg-violet-700 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Running AI Analysis...
            </span>
          ) : (
            "Run Full AI Analysis"
          )}
        </button>

        {/* Results */}
        {result && <ResultsPanel data={result} />}
      </div>
    </div>
  );
}
