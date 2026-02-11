"use client";

import { useState, useCallback, useRef, ReactNode } from "react";
import '../../globals.css'; // Make sure this path is correct

// ── Types ────────────────────────────────────────────────────────
type DimensionKey = "A1"|"A2"|"A3"|"A4"|"A5"|"I1"|"I2"|"I3"|"I4"|"I5"|"I6"|"T1"|"T2"|"T3"|"T4"|"T5"|"T6"|"V1"|"V2"|"V3"|"V4"|"V5"|"V6"|"W1"|"W2"|"W3"|"W4";
type Scores = Record<DimensionKey, number>;
type BadgeColor = "violet" | "teal" | "amber" | "red" | "emerald" | "slate";

interface TeacherComment {
  label?: string;
  teacher_name: string;
  subject_name: string;
  performance_rating: number;
  engagement_rating: number;
  comment_text: string;
}

interface SubjectEnrolment {
  subject_name: string;
  year_level: string;
  grade: string;
}

interface FullProfile {
  description: string;
  color: string;
  scores: Scores;
  subjects: SubjectEnrolment[];
  comments: Omit<TeacherComment, "label">[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisResult = Record<string, any>;

const DIMENSION_LABELS: Record<DimensionKey, string> = {
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

const CATEGORIES: Record<string, DimensionKey[]> = {
  "Aptitudes (A1-A5)": ["A1","A2","A3","A4","A5"],
  "Interests (I1-I6)": ["I1","I2","I3","I4","I5","I6"],
  "Traits (T1-T6)": ["T1","T2","T3","T4","T5","T6"],
  "Values (V1-V6)": ["V1","V2","V3","V4","V5","V6"],
  "Work Styles (W1-W4)": ["W1","W2","W3","W4"],
};

const PRESETS: Record<string, Scores> = {
  "All 5s (Flat)": Object.fromEntries(Object.keys(DIMENSION_LABELS).map(k => [k, 5])) as Scores,
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

const SAMPLE_COMMENTS: TeacherComment[] = [
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

const DEFAULT_SUBJECTS: SubjectEnrolment[] = [
  { subject_name: "Mathematics", year_level: "10", grade: "" },
  { subject_name: "English", year_level: "10", grade: "" },
  { subject_name: "Science", year_level: "10", grade: "" },
];

// ── Full Profiles (scores + comments + subjects + grades) ────────
const FULL_PROFILES: Record<string, FullProfile> = {
  "STEM Achiever (Alice)": {
    description: "Strong maths/science student, quiet, analytical",
    color: "violet",
    scores: {
      A1:3,A2:5,A3:4,A4:5,A5:5, I1:4,I2:5,I3:1,I4:2,I5:3,I6:3,
      T1:4,T2:4,T3:2,T4:5,T5:2,T6:4, V1:5,V2:4,V3:2,V4:2,V5:2,V6:3,
      W1:5,W2:3,W3:2,W4:5,
    },
    subjects: [
      { subject_name: "Mathematics", year_level: "10", grade: "A" },
      { subject_name: "Science", year_level: "10", grade: "A" },
      { subject_name: "English", year_level: "10", grade: "B" },
      { subject_name: "Digital Technologies", year_level: "10", grade: "A" },
    ],
    comments: [
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 5, engagement_rating: 4,
        comment_text: "Alice is a strong analytical thinker who consistently performs well on problem-solving tasks. She picks up new concepts quickly, particularly in the statistics and probability units. Her written work is always well-organised and she often helps classmates who are struggling. That said, Alice can be reluctant to participate in group discussions and tends to work independently even during collaborative tasks. Her written explanations could be more detailed — she often arrives at the correct answer but doesn't show her working clearly. She's expressed interest in the school's coding club and I'd recommend she consider Extension 1 Maths for Year 11.",
      },
      {
        teacher_name: "Ms Nguyen", subject_name: "Science",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Alice is exceptional in science. Her lab reports are detailed, methodical, and show genuine scientific thinking. She asks insightful questions during experiments and is always the first to spot patterns in data. She recently completed an independent research project on water quality that was well beyond the expected standard. Alice is clearly passionate about STEM and I'd strongly encourage her to pursue chemistry or physics in senior years.",
      },
    ],
  },

  "Creative Storyteller (Jordan)": {
    description: "Imaginative, strong writer, struggles with structure",
    color: "teal",
    scores: {
      A1:4,A2:2,A3:4,A4:1,A5:3, I1:2,I2:3,I3:5,I4:4,I5:3,I6:1,
      T1:2,T2:3,T3:4,T4:5,T5:4,T6:3, V1:3,V2:5,V3:4,V4:3,V5:2,V6:2,
      W1:2,W2:2,W3:3,W4:5,
    },
    subjects: [
      { subject_name: "English", year_level: "10", grade: "B" },
      { subject_name: "Drama", year_level: "10", grade: "A" },
      { subject_name: "Visual Arts", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "D" },
    ],
    comments: [
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 3, engagement_rating: 5,
        comment_text: "Jordan is one of the most creative students in the class. His creative writing pieces are genuinely impressive — vivid imagery, strong voice, and a real sense of storytelling. He gets very animated during class discussions about texts and always has an interesting perspective to share. The issue is with the more structured work. Essay writing is a real challenge for him. He struggles to organise his arguments logically and often misses deadlines. His spelling and grammar need consistent attention. He mentioned he's been writing a short film script outside of school which is great to see. I think he'd do well in a pathway that lets him use his imagination rather than one that's heavily academic.",
      },
      {
        teacher_name: "Ms Rivera", subject_name: "Drama",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Jordan is a natural performer and one of the most talented students I've taught. He has an instinctive understanding of character, timing, and emotional expression. He led our school production and every student in the cast looked to him for energy and direction. He also shows strong skills in scriptwriting and devising original pieces. Jordan clearly belongs in a creative career — whether that's acting, directing, screenwriting, or content creation.",
      },
    ],
  },

  "Future Entrepreneur (Marcus)": {
    description: "Charismatic leader, business-minded, impatient with detail",
    color: "amber",
    scores: {
      A1:4,A2:4,A3:2,A4:2,A5:3, I1:2,I2:3,I3:2,I4:3,I5:5,I6:3,
      T1:3,T2:4,T3:3,T4:4,T5:5,T6:5, V1:5,V2:5,V3:5,V4:3,V5:1,V6:3,
      W1:2,W2:5,W3:3,W4:4,
    },
    subjects: [
      { subject_name: "Commerce", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "B" },
      { subject_name: "English", year_level: "10", grade: "B" },
      { subject_name: "PDHPE", year_level: "10", grade: "A" },
    ],
    comments: [
      {
        teacher_name: "Mr Chen", subject_name: "Commerce",
        performance_rating: 4, engagement_rating: 5,
        comment_text: "Marcus is one of the most naturally entrepreneurial students I've encountered. He ran the school's fundraising drive and tripled the previous year's total by negotiating sponsorship deals with local businesses. He's excellent at pitching ideas and persuading others. His understanding of market dynamics and financial concepts is ahead of his peers. However, Marcus tends to rush through detailed analysis — his financial calculations sometimes have errors because he moves too fast. He's also occasionally dismissive of other students' ideas in group work, preferring to push his own vision. He'd benefit from learning to slow down and collaborate more genuinely.",
      },
      {
        teacher_name: "Mrs Thompson", subject_name: "English",
        performance_rating: 3, engagement_rating: 4,
        comment_text: "Marcus is an engaging speaker who dominates class discussions with confidence. His persuasive writing is strong, particularly when he's arguing for something he cares about. He struggles with analytical essays though — he tends to make sweeping generalisations rather than engaging deeply with the text. His reading log suggests he prefers business biographies and self-help books over fiction, which is fine, but he needs to broaden his engagement with literary texts for the HSC.",
      },
    ],
  },

  "Healthcare Carer (Amira)": {
    description: "Empathetic, patient, drawn to helping others",
    color: "emerald",
    scores: {
      A1:3,A2:3,A3:2,A4:2,A5:3, I1:3,I2:4,I3:2,I4:5,I5:2,I6:4,
      T1:5,T2:4,T3:5,T4:3,T5:3,T6:4, V1:3,V2:2,V3:1,V4:5,V5:5,V6:4,
      W1:4,W2:2,W3:5,W4:2,
    },
    subjects: [
      { subject_name: "Biology", year_level: "10", grade: "B+" },
      { subject_name: "PDHPE", year_level: "10", grade: "A" },
      { subject_name: "English", year_level: "10", grade: "B" },
      { subject_name: "Mathematics", year_level: "10", grade: "C+" },
    ],
    comments: [
      {
        teacher_name: "Dr Harris", subject_name: "Biology",
        performance_rating: 3, engagement_rating: 4,
        comment_text: "Amira is a caring and conscientious student who is especially engaged when we cover topics related to human health and the body. During our first aid unit, she was the most competent and composed student in the class — she even helped a peer who was feeling faint during a blood-typing demonstration. She volunteers at a local aged care facility on weekends, which clearly informs her understanding of health topics. Her written work is solid but not exceptional — she sometimes struggles with the more abstract biological concepts like genetics and evolution. I think nursing or allied health would be a great fit for her.",
      },
      {
        teacher_name: "Ms O'Brien", subject_name: "PDHPE",
        performance_rating: 4, engagement_rating: 5,
        comment_text: "Amira is a standout in PDHPE, particularly in the health and wellbeing components. She's empathetic, thoughtful, and genuinely interested in how to support others' mental and physical health. She led a peer support workshop on stress management that was genuinely helpful for other students. She's less interested in the sports science and movement components but participates willingly. She'd thrive in any caring profession — she has the temperament and the drive for it.",
      },
    ],
  },

  "Trades & Hands-On (Liam)": {
    description: "Practical, spatial thinker, prefers doing over reading",
    color: "amber",
    scores: {
      A1:2,A2:3,A3:5,A4:5,A5:2, I1:5,I2:2,I3:2,I4:2,I5:3,I6:3,
      T1:3,T2:4,T3:3,T4:2,T5:3,T6:5, V1:4,V2:5,V3:3,V4:3,V5:3,V6:5,
      W1:4,W2:2,W3:3,W4:3,
    },
    subjects: [
      { subject_name: "Industrial Technology", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "C" },
      { subject_name: "Science", year_level: "10", grade: "C" },
      { subject_name: "English", year_level: "10", grade: "D+" },
    ],
    comments: [
      {
        teacher_name: "Mr Kowalski", subject_name: "Industrial Technology",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Liam is the most naturally skilled student in the workshop I've had in years. His spatial awareness is exceptional — he can look at a technical drawing and immediately visualise the 3D object. He built a coffee table for his major project that was close to professional quality. He's meticulous with tools, follows safety protocols without being reminded, and takes real pride in his finished work. He's already done work experience with an electrician and came back buzzing about it. Liam is 100% suited to a trade and I'd encourage him to pursue an apprenticeship as soon as possible. Academic pathways would be a waste of his practical talent.",
      },
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 2, engagement_rating: 2,
        comment_text: "Liam struggles with abstract mathematical concepts and frequently disengages during lessons. He's capable of basic calculations and does well when maths is applied to practical problems — he calculated material costs and measurements for his woodwork project without any issues. But algebra, graphing, and any theoretical content is a real challenge. He's honest about finding it boring and I respect that. His attendance in maths has dropped this term. He'd benefit from a practical maths pathway rather than the standard course.",
      },
    ],
  },

  "Future Lawyer (Priya)": {
    description: "Articulate debater, detail-oriented, ambitious",
    color: "violet",
    scores: {
      A1:5,A2:4,A3:2,A4:1,A5:4, I1:1,I2:4,I3:2,I4:3,I5:4,I6:4,
      T1:5,T2:3,T3:2,T4:4,T5:4,T6:3, V1:5,V2:3,V3:5,V4:2,V5:2,V6:3,
      W1:5,W2:4,W3:2,W4:3,
    },
    subjects: [
      { subject_name: "English", year_level: "10", grade: "A" },
      { subject_name: "History", year_level: "10", grade: "A" },
      { subject_name: "Commerce", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "B+" },
    ],
    comments: [
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 5, engagement_rating: 4,
        comment_text: "Priya is one of the strongest analytical writers in the year group. Her essays are tightly structured, well-evidenced, and persuasive. She excels at close reading and can identify rhetorical techniques that other students miss entirely. She's captain of the debating team and has won multiple inter-school competitions. She can be quite competitive and occasionally comes across as dismissive of peers who don't match her level of preparation. Her creative writing is competent but lacks the emotional depth you'd expect — it feels more like a constructed argument than a story. She's clearly heading toward law or politics and has the intellectual firepower for it.",
      },
      {
        teacher_name: "Ms Garcia", subject_name: "History",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Priya is exceptional in history. She has a genuine passion for understanding how political systems work and change over time. Her research skills are outstanding — her essay on the Suffragette movement was one of the best I've read from a Year 10 student. She engages critically with primary sources and isn't afraid to challenge interpretations, including mine. She would be well-suited to law, public policy, or political science. My only concern is that she puts enormous pressure on herself and can become visibly stressed before assessments.",
      },
    ],
  },

  "Software Developer (Kai)": {
    description: "Logical problem-solver, self-taught coder, introverted",
    color: "teal",
    scores: {
      A1:3,A2:5,A3:4,A4:3,A5:5, I1:3,I2:5,I3:2,I4:1,I5:2,I6:3,
      T1:3,T2:4,T3:2,T4:5,T5:1,T6:4, V1:4,V2:5,V3:2,V4:1,V5:1,V6:4,
      W1:4,W2:1,W3:1,W4:5,
    },
    subjects: [
      { subject_name: "Digital Technologies", year_level: "10", grade: "A+" },
      { subject_name: "Mathematics", year_level: "10", grade: "A" },
      { subject_name: "Science", year_level: "10", grade: "B+" },
      { subject_name: "English", year_level: "10", grade: "C" },
    ],
    comments: [
      {
        teacher_name: "Mr Singh", subject_name: "Digital Technologies",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Kai is the most technically skilled student I've ever taught at this level. He taught himself Python before joining the class and has already built several working applications including a weather dashboard and a Discord bot. During class projects, he consistently goes far beyond the brief — when asked to build a basic website, he implemented a full backend with user authentication. He's a natural problem-solver who gets visibly excited when debugging complex issues. The challenge with Kai is collaboration. He prefers to work alone and can be impatient when explaining things to others. He also tends to over-engineer solutions when simpler approaches would suffice. He needs to develop his communication skills, but his technical future is incredibly bright.",
      },
      {
        teacher_name: "Mrs Thompson", subject_name: "English",
        performance_rating: 2, engagement_rating: 1,
        comment_text: "Kai is clearly intelligent but shows very little interest in English. He reads constantly — but only technical documentation and sci-fi novels, never the prescribed texts. His essays are logically structured but lack any literary flair or emotional engagement. He once submitted an essay that read almost like a technical specification. He barely participates in class discussions and I suspect he works on coding projects during my lessons. I've tried to engage him through science fiction texts but the response has been lukewarm. He's polite but clearly views English as an obstacle rather than a subject.",
      },
    ],
  },

  "Social Worker (Maya)": {
    description: "Deeply empathetic, passionate about justice, emotionally intense",
    color: "emerald",
    scores: {
      A1:4,A2:2,A3:2,A4:1,A5:3, I1:1,I2:3,I3:3,I4:5,I5:3,I6:2,
      T1:3,T2:2,T3:5,T4:4,T5:4,T6:2, V1:3,V2:3,V3:2,V4:5,V5:4,V6:2,
      W1:3,W2:3,W3:5,W4:3,
    },
    subjects: [
      { subject_name: "English", year_level: "10", grade: "B+" },
      { subject_name: "PDHPE", year_level: "10", grade: "A" },
      { subject_name: "History", year_level: "10", grade: "B" },
      { subject_name: "Mathematics", year_level: "10", grade: "C" },
    ],
    comments: [
      {
        teacher_name: "Ms O'Brien", subject_name: "PDHPE",
        performance_rating: 4, engagement_rating: 5,
        comment_text: "Maya is one of the most socially aware students I've taught. She's deeply passionate about mental health, equity, and social justice issues. She organised a student-led mental health awareness week that was genuinely impactful — several students told me they sought help because of it. She's a natural listener and peers often confide in her. My concern is that Maya takes on too much of other people's emotional weight. She's been visibly upset after hearing about classmates' struggles and I've spoken to the school counsellor about supporting her boundaries. She'd be an incredible social worker or counsellor but needs to learn to protect her own wellbeing.",
      },
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 3, engagement_rating: 4,
        comment_text: "Maya writes with genuine feeling and her personal essays are moving and authentic. She connects deeply with texts that deal with social issues — her response to 'The Hate U Give' was one of the most heartfelt pieces I've received. She's less strong with technical analysis and can let emotion override argument in her essays. Her creative writing tends to deal with heavy themes which is fine, but she needs to develop a wider range. She's an active participant in discussions, especially when social justice topics arise.",
      },
    ],
  },

  "Sports Scientist (Tyler)": {
    description: "Athletic, competitive, interested in the science of performance",
    color: "amber",
    scores: {
      A1:3,A2:3,A3:3,A4:3,A5:2, I1:5,I2:3,I3:1,I4:3,I5:4,I6:2,
      T1:4,T2:5,T3:3,T4:2,T5:5,T6:5, V1:5,V2:3,V3:4,V4:3,V5:2,V6:3,
      W1:3,W2:4,W3:3,W4:2,
    },
    subjects: [
      { subject_name: "PDHPE", year_level: "10", grade: "A" },
      { subject_name: "Science", year_level: "10", grade: "B" },
      { subject_name: "Mathematics", year_level: "10", grade: "B" },
      { subject_name: "English", year_level: "10", grade: "C+" },
    ],
    comments: [
      {
        teacher_name: "Mr Williams", subject_name: "PDHPE",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Tyler is a gifted athlete who represents the school in swimming and athletics. But what sets him apart is his genuine interest in the science behind physical performance. He asks detailed questions about biomechanics, nutrition, and training periodisation that go well beyond the syllabus. He recently completed a self-directed project analysing his own swim stroke using video analysis software. He's also a strong team player and captains the swim team with maturity beyond his years. Tyler would thrive in sports science, exercise physiology, or physiotherapy. He has the rare combination of practical athletic talent and intellectual curiosity about human performance.",
      },
      {
        teacher_name: "Ms Nguyen", subject_name: "Science",
        performance_rating: 3, engagement_rating: 3,
        comment_text: "Tyler is a capable science student who performs best when he can see a practical application for what he's learning. He was highly engaged during the biology unit on the human body and less so during chemistry and physics. His lab work is competent and he follows methods carefully. He's not naturally drawn to abstract scientific concepts but can grasp them with effort. I think he'd do well in a science-adjacent field that has a clear practical focus like sports science or health science.",
      },
    ],
  },

  // ── EDGE CASES ──────────────────────────────────────────────────

  "EDGE: Teachers Disagree (Conflicting Views)": {
    description: "Maths teacher sees a leader; English teacher sees a passive follower. Who's right?",
    color: "red",
    scores: {
      A1:3,A2:4,A3:3,A4:3,A5:3, I1:3,I2:3,I3:3,I4:3,I5:4,I6:3,
      T1:3,T2:3,T3:3,T4:3,T5:4,T6:3, V1:3,V2:3,V3:3,V4:3,V5:3,V6:3,
      W1:3,W2:4,W3:3,W4:3,
    },
    subjects: [
      { subject_name: "Mathematics", year_level: "10", grade: "A" },
      { subject_name: "English", year_level: "10", grade: "C" },
      { subject_name: "Science", year_level: "10", grade: "B" },
    ],
    comments: [
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Daniel is an outstanding leader in my class. He naturally takes charge during group activities, delegates tasks effectively, and ensures everyone understands the work. He's confident, articulate, and always the first to volunteer answers. He organises study groups before exams and other students genuinely look up to him. He's one of the most socially skilled and academically capable students I've ever taught. I see strong leadership potential — he could go into management, engineering leadership, or any field where people skills and technical ability intersect.",
      },
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 2, engagement_rating: 1,
        comment_text: "Daniel is one of the quietest students in my class. He barely participates in discussions, rarely makes eye contact, and seems uncomfortable when called upon. In group work, he consistently defers to others and contributes minimally. His written work is below average and suggests he puts in little effort. He seems disengaged and possibly uninterested in the subject entirely. I've tried to draw him out multiple times without success. I wouldn't describe him as a leader in any sense — he's very much a passive participant who goes with the flow. I'm genuinely concerned about his engagement levels.",
      },
      {
        teacher_name: "Ms Nguyen", subject_name: "Science",
        performance_rating: 3, engagement_rating: 3,
        comment_text: "Daniel is a steady, middle-of-the-road student in science. He does what's required and nothing more. He's neither a leader nor a follower — he works competently on his own and contributes adequately in group settings. I don't have a strong read on his strengths or interests. He seems like a different person depending on the subject, which I've heard from other teachers too. His marks are consistently average.",
      },
    ],
  },

  "EDGE: Assessment ≠ Teachers (Self-Overrating)": {
    description: "Student rates themselves very highly on everything; teachers paint a very different picture",
    color: "red",
    scores: {
      A1:5,A2:5,A3:5,A4:5,A5:5, I1:5,I2:5,I3:5,I4:5,I5:5,I6:5,
      T1:5,T2:5,T3:5,T4:5,T5:5,T6:5, V1:5,V2:5,V3:5,V4:5,V5:5,V6:5,
      W1:5,W2:5,W3:5,W4:5,
    },
    subjects: [
      { subject_name: "Mathematics", year_level: "10", grade: "D" },
      { subject_name: "English", year_level: "10", grade: "D" },
      { subject_name: "Science", year_level: "10", grade: "D+" },
      { subject_name: "History", year_level: "10", grade: "C-" },
    ],
    comments: [
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 1, engagement_rating: 2,
        comment_text: "I'm quite concerned about this student's self-awareness. In our one-on-one meeting, they described themselves as 'probably the best maths student in the year' despite scoring in the bottom quarter consistently. They struggle with basic operations and frequently make errors that suggest a lack of foundational understanding. They don't seek help and seem to genuinely believe they're performing well. When I showed them their marks relative to the class average, they were shocked. I think there may be a disconnect between effort and understanding — they do attend every class and appear to be trying, but their study methods are clearly ineffective. They need targeted support and, honestly, a realistic conversation about their current level.",
      },
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 1, engagement_rating: 3,
        comment_text: "This student is enthusiastic but significantly overestimates their ability. They volunteer for every presentation and discussion but their contributions often miss the point of the text or question. Their essays show surface-level understanding at best — they tend to retell the plot rather than analyse it. They seem to equate confidence with competence, which is a concern for their development. On a positive note, they're eager and well-intentioned, and they take feedback without becoming defensive — they just don't seem to internalise it. With the right support and honest feedback, they could improve, but right now there's a large gap between their self-perception and reality.",
      },
    ],
  },

  "EDGE: All Extremes (No Middle Ground)": {
    description: "Only 1s and 5s — extreme differentiation, unusual pattern",
    color: "red",
    scores: {
      A1:5,A2:1,A3:1,A4:5,A5:1, I1:5,I2:1,I3:5,I4:1,I5:5,I6:1,
      T1:1,T2:5,T3:1,T4:5,T5:1,T6:5, V1:5,V2:1,V3:5,V4:1,V5:5,V6:1,
      W1:1,W2:5,W3:1,W4:5,
    },
    subjects: [
      { subject_name: "Music", year_level: "10", grade: "A" },
      { subject_name: "Industrial Technology", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "F" },
      { subject_name: "English", year_level: "10", grade: "F" },
    ],
    comments: [
      {
        teacher_name: "Ms Rivera", subject_name: "Music",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Zara is a musical prodigy. She plays three instruments at a high level and composes her own pieces. She's completely self-directed in music — I often learn from her. She performed an original composition at the school concert that received a standing ovation. However, outside of music and her other passion (working with her hands in tech), she shows zero interest in anything academic. She's told me bluntly that she thinks most school subjects are a waste of her time.",
      },
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 1, engagement_rating: 1,
        comment_text: "Zara does not engage with mathematics at all. She has failed every assessment this year and openly states she doesn't care. She spends most of the lesson writing music or sketching mechanical designs. I've tried multiple approaches but she's made it clear that maths is not something she values. Her parents are aware and are supportive of her pursuing creative/vocational pathways. I don't think forcing a standard academic path is appropriate for this student.",
      },
    ],
  },

  "EDGE: Hidden Talent (Low Self-Assessment)": {
    description: "Student underrates themselves across the board; teachers see strong potential",
    color: "red",
    scores: {
      A1:1,A2:1,A3:2,A4:2,A5:1, I1:2,I2:2,I3:1,I4:2,I5:1,I6:2,
      T1:2,T2:1,T3:2,T4:1,T5:1,T6:1, V1:1,V2:2,V3:1,V4:2,V5:2,V6:2,
      W1:2,W2:1,W3:2,W4:1,
    },
    subjects: [
      { subject_name: "Science", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "A-" },
      { subject_name: "English", year_level: "10", grade: "B+" },
      { subject_name: "Geography", year_level: "10", grade: "A" },
    ],
    comments: [
      {
        teacher_name: "Ms Nguyen", subject_name: "Science",
        performance_rating: 5, engagement_rating: 4,
        comment_text: "Ethan is one of the most capable students in Year 10 but seems to have absolutely no awareness of it. He consistently tops the class in assessments but when I praised his work, he seemed genuinely confused and said 'I just got lucky.' His lab work is meticulous and his analytical thinking is excellent. He's quiet and self-effacing but when he does contribute to discussions, his insights are some of the best in the class. I'm concerned that his lack of confidence may prevent him from pursuing challenging pathways that he's more than capable of handling. He'd excel in any STEM field but needs someone to help him see his own potential.",
      },
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 4, engagement_rating: 3,
        comment_text: "Ethan is a frustrating case because he's clearly very talented but seems to actively avoid recognition. He solves complex problems with elegant approaches but never volunteers answers. When I selected him for the maths olympiad team, he tried to decline saying 'there are better students.' He ended up placing second in the regional competition. I've spoken to his parents and they say he's the same at home — very capable but extremely self-critical. His self-assessment would likely show much lower confidence than his actual ability warrants. He needs encouragement and affirmation.",
      },
    ],
  },

  "EDGE: Overachiever Burnout (High Grades, Stressed)": {
    description: "Perfect grades but teachers see signs of burnout, anxiety, and excessive pressure",
    color: "red",
    scores: {
      A1:4,A2:5,A3:4,A4:3,A5:4, I1:3,I2:4,I3:3,I4:3,I5:3,I6:4,
      T1:5,T2:2,T3:3,T4:3,T5:3,T6:2, V1:5,V2:2,V3:5,V4:2,V5:3,V6:2,
      W1:5,W2:3,W3:3,W4:3,
    },
    subjects: [
      { subject_name: "Mathematics Ext 1", year_level: "10", grade: "A+" },
      { subject_name: "English Advanced", year_level: "10", grade: "A+" },
      { subject_name: "Chemistry", year_level: "10", grade: "A+" },
      { subject_name: "Physics", year_level: "10", grade: "A+" },
      { subject_name: "Economics", year_level: "10", grade: "A" },
    ],
    comments: [
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics Ext 1",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Grace is the top-performing student in Extension 1 Mathematics. Her work is flawless and she has a deep conceptual understanding of everything we cover. However, I'm increasingly concerned about her wellbeing. She broke down in tears after receiving 95% on a test because she'd made 'a stupid mistake.' She stays up until 2am studying most nights according to her peers. She puts enormous pressure on herself to be perfect and I've noticed her hands shaking before assessments. She's told me she 'needs' to get into medicine and anything less would be a failure. I've spoken to the school counsellor about her. Academically she's outstanding, but I'm worried she's on a path to burnout before she finishes Year 12.",
      },
      {
        teacher_name: "Dr Harris", subject_name: "Chemistry",
        performance_rating: 5, engagement_rating: 4,
        comment_text: "Grace is brilliant in chemistry — she has an intuitive understanding of reaction mechanisms that most university students would envy. But I'm echoing the concerns of other teachers about her mental health. She once asked me after class, in complete seriousness, whether getting a B+ in one subject would 'ruin her ATAR.' She doesn't seem to have hobbies or social activities outside of study. She mentioned dropping out of netball to have more study time. I've encouraged her to consider that there are many paths to a fulfilling career, but she's fixated on a single outcome. Her parents seem to be adding to the pressure rather than alleviating it. She needs support more than she needs academic extension right now.",
      },
    ],
  },

  "EDGE: Minimal Data (No Comments)": {
    description: "Assessment scores only, no teacher comments, no grades — tests AI with sparse input",
    color: "slate",
    scores: {
      A1:4,A2:3,A3:3,A4:2,A5:4, I1:2,I2:4,I3:3,I4:3,I5:2,I6:3,
      T1:3,T2:4,T3:3,T4:4,T5:3,T6:3, V1:3,V2:4,V3:2,V4:3,V5:3,V6:3,
      W1:3,W2:3,W3:3,W4:4,
    },
    subjects: [],
    comments: [],
  },

  "EDGE: Contradictory Interests": {
    description: "Loves both art and accounting — unusual combination. High artistic AND conventional",
    color: "red",
    scores: {
      A1:4,A2:5,A3:5,A4:1,A5:4, I1:1,I2:3,I3:5,I4:2,I5:3,I6:5,
      T1:5,T2:4,T3:2,T4:5,T5:3,T6:4, V1:4,V2:4,V3:3,V4:2,V5:2,V6:4,
      W1:5,W2:2,W3:2,W4:5,
    },
    subjects: [
      { subject_name: "Visual Arts", year_level: "10", grade: "A" },
      { subject_name: "Commerce", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "A-" },
      { subject_name: "English", year_level: "10", grade: "B" },
    ],
    comments: [
      {
        teacher_name: "Ms Tanaka", subject_name: "Visual Arts",
        performance_rating: 5, engagement_rating: 5,
        comment_text: "Rin is an exceptionally talented visual artist with a particular strength in graphic design and digital illustration. Her portfolio is stunning — clean, precise, and innovative. What makes her unusual is that she approaches art with almost scientific precision. She meticulously plans compositions using the golden ratio, colour theory, and grid systems. She told me she wants to combine art with business somehow. She's been designing logos and branding materials for local businesses as a side project and apparently charges for it already. She's not your typical 'free-spirited artist' — she's methodical, deadline-oriented, and business-savvy. UX design, brand strategy, or creative direction would suit her perfectly.",
      },
      {
        teacher_name: "Mr Chen", subject_name: "Commerce",
        performance_rating: 4, engagement_rating: 4,
        comment_text: "Rin is an unusual commerce student in the best way. She brings a creative perspective to business problems that other students don't have. Her market research project included beautifully designed infographics that made the data genuinely engaging. She understands financial concepts well and her business plan for a graphic design studio was one of the most viable I've seen from a student. She's clearly someone who can bridge the creative and commercial worlds. I think she'd thrive in a field where aesthetics and business intersect — advertising, design consultancy, or product design.",
      },
    ],
  },

  "EDGE: Career Changer (Conflicting Signals)": {
    description: "Was sure about medicine, now interested in music. Teachers divided, grades mixed",
    color: "red",
    scores: {
      A1:3,A2:4,A3:3,A4:2,A5:3, I1:3,I2:4,I3:4,I4:4,I5:2,I6:2,
      T1:3,T2:3,T3:4,T4:5,T5:3,T6:3, V1:3,V2:4,V3:2,V4:4,V5:3,V6:2,
      W1:3,W2:2,W3:4,W4:4,
    },
    subjects: [
      { subject_name: "Biology", year_level: "10", grade: "B+" },
      { subject_name: "Chemistry", year_level: "10", grade: "B" },
      { subject_name: "Music", year_level: "10", grade: "A" },
      { subject_name: "Mathematics", year_level: "10", grade: "B" },
    ],
    comments: [
      {
        teacher_name: "Dr Harris", subject_name: "Biology",
        performance_rating: 3, engagement_rating: 2,
        comment_text: "Sam used to be one of my most engaged biology students and had spoken about wanting to be a doctor since Year 7. This year something has shifted. His marks have dropped from As to Bs, he seems distracted in class, and he told me last week that he's 'not sure about medicine anymore.' His parents are apparently still very keen on the medical pathway. He's competent in biology but the passion that used to drive him seems to have faded. I'm not sure whether this is a genuine change in interests or just a phase. He's been spending a lot of time in the music rooms during lunch.",
      },
      {
        teacher_name: "Ms Rivera", subject_name: "Music",
        performance_rating: 4, engagement_rating: 5,
        comment_text: "Sam has had a remarkable transformation this year. He joined music as an elective almost reluctantly but has become one of the most passionate students in the class. He picked up guitar six months ago and is already playing at an intermediate level — his rate of improvement is extraordinary. He's started writing songs and performed at the school open mic night, which took real courage. He told me he wants to pursue music but his parents want him to be a doctor. I can see genuine talent and passion here, but I also know the music industry is tough. Perhaps there's a way to combine both interests — music therapy, audio engineering, or even continuing music alongside a health science degree.",
      },
    ],
  },

  "EDGE: The Quiet Enigma (Minimal Teacher Signal)": {
    description: "Teachers have almost nothing to say — student is invisible. Tests AI with vague qualitative data",
    color: "slate",
    scores: {
      A1:3,A2:3,A3:4,A4:3,A5:3, I1:3,I2:3,I3:3,I4:3,I5:2,I6:3,
      T1:3,T2:4,T3:3,T4:3,T5:2,T6:3, V1:3,V2:3,V3:2,V4:3,V5:3,V6:3,
      W1:3,W2:2,W3:3,W4:3,
    },
    subjects: [
      { subject_name: "Mathematics", year_level: "10", grade: "C+" },
      { subject_name: "English", year_level: "10", grade: "C" },
      { subject_name: "Science", year_level: "10", grade: "C+" },
    ],
    comments: [
      {
        teacher_name: "Mrs Patterson", subject_name: "Mathematics",
        performance_rating: 3, engagement_rating: 2,
        comment_text: "To be honest, I don't have much to say about this student. They attend class, complete work on time, and their marks are average. They don't cause problems but they don't stand out either. I couldn't tell you what their interests are or what they want to do after school. They don't engage in discussions and haven't formed close friendships in class that I've noticed. It's possible there's more going on beneath the surface but I haven't been able to draw it out.",
      },
      {
        teacher_name: "Mr Okafor", subject_name: "English",
        performance_rating: 2, engagement_rating: 2,
        comment_text: "I find it difficult to write a meaningful comment for this student because they give me so little to work with. They're present physically but not engaged. Their work meets the minimum requirements. When I asked them what career they're interested in, they shrugged. I'm not sure if they're genuinely undecided, unmotivated, or just very private. Their writing doesn't reveal strong opinions or passions. I'd recommend career counselling to help them identify some direction.",
      },
    ],
  },
};

// ── Colour-coded score button styles ────────────────────────────
// Inlined to ensure Tailwind JIT scanner detects every class.

const SCORE_COLORS: Record<number, { bg: string; border: string; hoverBg: string; hoverBorder: string; hoverText: string }> = {
  1: { bg: "#ef4444", border: "#ef4444", hoverBg: "#fef2f2", hoverBorder: "#fca5a5", hoverText: "#dc2626" },
  2: { bg: "#f97316", border: "#f97316", hoverBg: "#fff7ed", hoverBorder: "#fdba74", hoverText: "#ea580c" },
  3: { bg: "#f59e0b", border: "#f59e0b", hoverBg: "#fffbeb", hoverBorder: "#fcd34d", hoverText: "#d97706" },
  4: { bg: "#14b8a6", border: "#14b8a6", hoverBg: "#f0fdfa", hoverBorder: "#5eead4", hoverText: "#0d9488" },
  5: { bg: "#7c3aed", border: "#7c3aed", hoverBg: "#f5f3ff", hoverBorder: "#a78bfa", hoverText: "#7c3aed" },
};

// ── Reusable Components ─────────────────────────────────────────

function Badge({ children, color = "violet" }: { children: ReactNode; color?: BadgeColor }) {
  const colors: Record<BadgeColor, string> = {
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    emerald: "bg-green-50 text-green-700 border-green-200",
    slate: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${colors[color]}`}>
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

function ScoreButton({ v, selected, onClick }: { v: number; selected: boolean; onClick: () => void }) {
  const c = SCORE_COLORS[v];
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = selected
    ? { backgroundColor: c.bg, borderColor: c.border, color: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }
    : hovered
      ? { backgroundColor: c.hoverBg, borderColor: c.hoverBorder, color: c.hoverText }
      : { backgroundColor: "transparent", borderColor: "#e5e7eb", color: "#6b7280" };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: 40, height: 40, borderRadius: "9999px", borderWidth: 2, borderStyle: "solid", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", ...style }}
    >
      {v}
    </button>
  );
}

function ScoreInput({ id, label, value, onChange }: { id: DimensionKey; label: string; value: number; onChange: (id: DimensionKey, val: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0" }}>
      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#9ca3af", width: 32, flexShrink: 0 }}>{id}</span>
      <span style={{ fontSize: 14, color: "#374151", width: 192, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {[1,2,3,4,5].map(v => (
          <ScoreButton key={v} v={v} selected={value === v} onClick={() => onChange(id, v)} />
        ))}
      </div>
    </div>
  );
}

// ── Teacher Comment Form ─────────────────────────────────────────

function CommentForm({ comment, index, onChange, onRemove }: { comment: TeacherComment; index: number; onChange: (i: number, c: TeacherComment) => void; onRemove: (i: number) => void }) {
  const update = (field: keyof TeacherComment, value: string | number) => onChange(index, { ...comment, [field]: value });
  const inputStyle: React.CSSProperties = { width: "100%", borderRadius: 12, border: "1px solid #d1d5db", padding: "12px 16px", fontSize: 14, outline: "none" };
  const selectStyle: React.CSSProperties = { flex: 1, borderRadius: 12, border: "1px solid #d1d5db", padding: "12px 16px", fontSize: 14, outline: "none", cursor: "pointer" };
  return (
    <div style={{ backgroundColor: "#f9fafb", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>Comment #{index + 1}</span>
        <button onClick={() => onRemove(index)} style={{ fontSize: 12, color: "#ef4444", padding: "6px 12px", borderRadius: 8, cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}>
          Remove
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
        <input
          style={inputStyle}
          placeholder="Teacher name"
          value={comment.teacher_name}
          onChange={e => update("teacher_name", e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Subject"
          value={comment.subject_name}
          onChange={e => update("subject_name", e.target.value)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 14, color: "#4b5563", fontWeight: 500, whiteSpace: "nowrap" }}>Performance</label>
          <select
            style={selectStyle}
            value={comment.performance_rating}
            onChange={e => update("performance_rating", +e.target.value)}
          >
            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}/5</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 14, color: "#4b5563", fontWeight: 500, whiteSpace: "nowrap" }}>Engagement</label>
          <select
            style={selectStyle}
            value={comment.engagement_rating}
            onChange={e => update("engagement_rating", +e.target.value)}
          >
            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}/5</option>)}
          </select>
        </div>
      </div>
      <textarea
        style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
        placeholder="Teacher's comment..."
        value={comment.comment_text}
        onChange={e => update("comment_text", e.target.value)}
      />
    </div>
  );
}

// ── Results Display ──────────────────────────────────────────────

function ResultsPanel({ data }: { data: AnalysisResult }) {
  const [showRaw, setShowRaw] = useState(false);

  const cardStyle: React.CSSProperties = { backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6", padding: 32 };
  const sectionGap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 32 };

  if (data.error) {
    return (
      <div style={{ ...cardStyle, borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
        <p style={{ color: "#991b1b", fontWeight: 600, fontSize: 18 }}>Analysis failed</p>
        <p style={{ fontSize: 14, color: "#dc2626", marginTop: 8 }}>{data.error}</p>
      </div>
    );
  }

  const confidencePct = ((data.confidence_score || 0) * 100).toFixed(0);
  const confidenceColor = (data.confidence_score || 0) >= 0.7 ? "#16a34a" : (data.confidence_score || 0) >= 0.4 ? "#d97706" : "#dc2626";

  // Map API field names — the LLM returns strengths/gaps, analysis_engine.py copies them to strength_profile/gap_analysis
  const strengths = data.strength_profile || data.strengths || [];
  const gaps = data.gap_analysis || data.gaps || [];

  return (
    <div style={sectionGap}>
      {/* Confidence + Weighting */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Data Weighting</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>How the AI weighted the evidence</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, border: "1px solid", color: confidenceColor, borderColor: confidenceColor, backgroundColor: `${confidenceColor}10` }}>
            Confidence: {confidencePct}%
          </span>
        </div>
        {data.data_weighting && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
              <span style={{ color: "#6b7280", width: 160, flexShrink: 0 }}>Assessment weight</span>
              <div style={{ flex: 1, backgroundColor: "#f3f4f6", borderRadius: 9999, height: 14, overflow: "hidden" }}>
                <div style={{ width: `${(data.data_weighting.assessment_weight || 0) * 100}%`, backgroundColor: "#7c3aed", height: "100%", borderRadius: 9999 }} />
              </div>
              <span style={{ color: "#1f2937", fontWeight: 600, width: 56, textAlign: "right" }}>{((data.data_weighting.assessment_weight || 0) * 100).toFixed(0)}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14 }}>
              <span style={{ color: "#6b7280", width: 160, flexShrink: 0 }}>Teacher weight</span>
              <div style={{ flex: 1, backgroundColor: "#f3f4f6", borderRadius: 9999, height: 14, overflow: "hidden" }}>
                <div style={{ width: `${(data.data_weighting.teacher_weight || 0) * 100}%`, backgroundColor: "#14b8a6", height: "100%", borderRadius: 9999 }} />
              </div>
              <span style={{ color: "#1f2937", fontWeight: 600, width: 56, textAlign: "right" }}>{((data.data_weighting.teacher_weight || 0) * 100).toFixed(0)}%</span>
            </div>
            <p style={{ fontSize: 14, color: "#4b5563", marginTop: 8, fontStyle: "italic", borderLeft: "2px solid #c4b5fd", paddingLeft: 16 }}>{data.data_weighting.reasoning}</p>
          </div>
        )}
      </div>

      {/* Final Ranking */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Top 5 Career Recommendations</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, marginBottom: 24 }}>AI-ranked based on all available evidence</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {(data.final_ranking || []).map((career: AnalysisResult, i: number) => (
            <div key={i} style={{ border: "1px solid #f3f4f6", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", flexShrink: 0 }}>
                    {career.rank || i + 1}.
                  </span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>{career.career_name}</h3>
                    <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>{career.soc_code}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {career.from_deterministic_top20 === false && <Badge color="amber">AI Injected</Badge>}
                  {career.original_position && career.rank !== career.original_position && (
                    <Badge color="teal">Moved from #{career.original_position}</Badge>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 16, lineHeight: 1.6 }}>{career.reasoning}</p>
              {career.key_evidence && career.key_evidence.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {career.key_evidence.map((ev: string, j: number) => (
                    <span key={j} style={{ fontSize: 12, backgroundColor: "#f9fafb", color: "#4b5563", padding: "6px 12px", borderRadius: 9999, border: "1px solid #e5e7eb", fontWeight: 500 }}>{ev}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Strength Profile</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, marginBottom: 24 }}>Based on assessment scores and teacher observations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {strengths.map((s: AnalysisResult, i: number) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: 20, backgroundColor: "#f0fdf4", borderRadius: 12, border: "1px solid #dcfce7" }}>
                <span style={{ marginTop: 6, width: 10, height: 10, borderRadius: 9999, backgroundColor: "#22c55e", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999, backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                      {(s.score * 100).toFixed(0)}%
                    </span>
                    {s.teacher_confirmed && (
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999, backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                        Teacher confirmed
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{s.dimension}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Growth Opportunities</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, marginBottom: 24 }}>Areas for development</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {gaps.map((g: AnalysisResult, i: number) => {
              const isSignificant = g.severity === "significant";
              return (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: 20, backgroundColor: isSignificant ? "#fef2f2" : "#fffbeb", borderRadius: 12, border: `1px solid ${isSignificant ? "#fecaca" : "#fef3c7"}` }}>
                  <span style={{ marginTop: 6, width: 10, height: 10, borderRadius: 9999, backgroundColor: isSignificant ? "#ef4444" : "#f59e0b", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{g.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999, backgroundColor: isSignificant ? "#fef2f2" : "#fffbeb", color: isSignificant ? "#dc2626" : "#d97706", border: `1px solid ${isSignificant ? "#fecaca" : "#fde68a"}` }}>
                        {g.severity}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999, backgroundColor: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                        {(g.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{g.dimension}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {data.conflicts && data.conflicts.length > 0 && (
        <div style={{ ...cardStyle, borderColor: "#fde68a" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Interesting Discrepancies</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, marginBottom: 24 }}>Where your self-assessment and teacher observations differ</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {data.conflicts.map((c: AnalysisResult, i: number) => {
              const conflict = typeof c === "string" ? c : null;
              const conflictObj = typeof c === "object" ? c : null;
              return (
                <div key={i} style={{ backgroundColor: "#fffbeb", borderRadius: 12, padding: 24, border: "1px solid #fef3c7" }}>
                  {conflict && <p style={{ fontSize: 14, color: "#92400e" }}>{conflict}</p>}
                  {conflictObj && (
                    <>
                      <p style={{ fontWeight: 600, color: "#92400e", marginBottom: 16 }}>{conflictObj.dimension || conflictObj.area}</p>
                      {(conflictObj.assessment_says || conflictObj.teacher_says) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #fef3c7" }}>
                            <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Your assessment</span>
                            <p style={{ fontSize: 14, color: "#1f2937", marginTop: 8, fontWeight: 500 }}>{conflictObj.assessment_says}</p>
                          </div>
                          <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #fef3c7" }}>
                            <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Teacher says</span>
                            <p style={{ fontSize: 14, color: "#1f2937", marginTop: 8, fontWeight: 500 }}>{conflictObj.teacher_says}</p>
                          </div>
                        </div>
                      )}
                      {conflictObj.ai_interpretation && (
                        <p style={{ fontSize: 14, color: "#92400e", fontStyle: "italic", borderLeft: "2px solid #fcd34d", paddingLeft: 16 }}>{conflictObj.ai_interpretation}</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Narrative */}
      {data.overall_narrative && (
        <div style={{ ...cardStyle, backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Your Career Profile Summary</h2>
          <p style={{ color: "#374151", lineHeight: 1.7, fontSize: 15 }}>{data.overall_narrative}</p>
        </div>
      )}

      {/* Raw JSON Toggle */}
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <button
          onClick={() => setShowRaw(!showRaw)}
          style={{ fontSize: 14, color: "#9ca3af", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}
        >
          {showRaw ? "Hide" : "Show"} raw JSON response
        </button>
        {showRaw && (
          <pre style={{ marginTop: 16, padding: 24, backgroundColor: "#111827", color: "#4ade80", borderRadius: 16, fontSize: 12, overflow: "auto", maxHeight: 384, textAlign: "left" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function AnalysisTestPage() {
  const [answers, setAnswers] = useState<Scores>(PRESETS["STEM Student"]);
  const [comments, setComments] = useState<TeacherComment[]>([]);
  const [subjects, setSubjects] = useState<SubjectEnrolment[]>([...DEFAULT_SUBJECTS]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
  const resultsRef = useRef<HTMLDivElement>(null);

  const setPreset = (name: string) => setAnswers({ ...PRESETS[name] });
  const setScore = (id: DimensionKey, val: number) => setAnswers(prev => ({ ...prev, [id]: val }));

  const loadFullProfile = (name: string) => {
    const profile = FULL_PROFILES[name];
    if (!profile) return;
    setAnswers({ ...profile.scores });
    setComments(profile.comments.map(c => ({ ...c })));
    setSubjects(profile.subjects.map(s => ({ ...s })));
    setResult(null);
  };

  const addComment = () => {
    setComments(prev => [...prev, { teacher_name: "", subject_name: "", performance_rating: 3, engagement_rating: 3, comment_text: "" }]);
  };
  const updateComment = (i: number, c: TeacherComment) => setComments(prev => prev.map((x, j) => j === i ? c : x));
  const removeComment = (i: number) => setComments(prev => prev.filter((_, j) => j !== i));
  const loadSampleComment = (sample: TeacherComment) => {
    setComments(prev => [...prev, { ...sample }]);
  };

  const addSubject = () => setSubjects(prev => [...prev, { subject_name: "", year_level: "10", grade: "" }]);
  const updateSubject = (i: number, field: keyof SubjectEnrolment, val: string) => setSubjects(prev => prev.map((s, j) => j === i ? { ...s, [field]: val } : s));
  const removeSubject = (i: number) => setSubjects(prev => prev.filter((_, j) => j !== i));

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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setLoading(false);
  }, [answers, comments, subjects, apiUrl]);

  // Quality check preview
  const values = Object.values(answers);
  const allSame = new Set(values).size === 1;
  const mostCommon = Math.max(...Object.values(values.reduce<Record<number, number>>((a, v) => ({ ...a, [v]: (a[v]||0)+1 }), {})));
  const straightLineRatio = mostCommon / values.length;

  const qualityInfo = allSame
    ? { label: "Invalid — all identical", color: "bg-red-50 text-red-700 border-red-200" }
    : straightLineRatio > 0.8
    ? { label: "Low confidence — straight-lining detected", color: "bg-amber-50 text-amber-700 border-amber-200" }
    : new Set(values).size <= 2
    ? { label: "Medium confidence — limited differentiation", color: "bg-amber-50 text-amber-700 border-amber-200" }
    : { label: "High confidence", color: "bg-green-50 text-green-700 border-green-200" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-12 py-12">
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
        {/* Full Profiles */}
        <Card className="p-8">
          <SectionTitle subtitle="Load a complete student profile — fills scores, teacher comments, subjects & grades all at once">Full Test Profiles</SectionTitle>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Career Archetypes</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(FULL_PROFILES).filter(([k]) => !k.startsWith("EDGE")).map(([name, p]) => (
                  <button key={name} onClick={() => loadFullProfile(name)} className={`px-4 py-3 text-xs font-medium rounded-xl cursor-pointer transition-all hover:shadow-md border ${
                    p.color === "violet" ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" :
                    p.color === "teal" ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100" :
                    p.color === "amber" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
                    p.color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                    "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}>
                    <div className="font-semibold text-left">{name}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-left">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Edge Cases & Pressure Tests</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(FULL_PROFILES).filter(([k]) => k.startsWith("EDGE")).map(([name, p]) => (
                  <button key={name} onClick={() => loadFullProfile(name)} className="px-4 py-3 text-xs font-medium rounded-xl cursor-pointer transition-all hover:shadow-md border bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                    <div className="font-semibold text-left">{name.replace("EDGE: ", "")}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-left">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

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
            {SAMPLE_COMMENTS.map((s, i) => (
              <button
                key={i}
                onClick={() => loadSampleComment(s)}
                className="px-5 py-2.5 text-sm font-medium border border-teal-200 text-teal-700 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors"
              >
                + {s.label}
              </button>
            ))}
          </div>
          {comments.map((c, i) => (
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
            {subjects.map((s, i) => (
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
          style={{
            width: "100%",
            padding: "20px 0",
            borderRadius: 16,
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            backgroundColor: loading ? "#9ca3af" : "#7c3aed",
            boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Running AI Analysis..." : "Run Full AI Analysis"}
        </button>

        {/* Results */}
        <div ref={resultsRef} />
        {result && <ResultsPanel data={result} />}
      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid #e5e7eb",
        padding: "12px 0",
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 12, padding: "0 24px" }}>
          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              backgroundColor: loading ? "#9ca3af" : "#7c3aed",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Running..." : "Run Analysis"}
          </button>
          {result && (
            <button
              onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                color: "#374151",
                fontWeight: 600,
                fontSize: 15,
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              Jump to Results
            </button>
          )}
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div style={{ height: 72 }} />
    </div>
  );
}
