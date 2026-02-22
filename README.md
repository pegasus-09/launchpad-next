# Launchpad — Frontend

AI-powered career guidance platform for students. Built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend/Auth**: Supabase
- **PDF Export**: html2pdf.js
- **Icons**: Lucide React
- **Analytics**: Vercel Speed Insights

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── login/              # Login
│   ├── signup/             # Signup
│   ├── student/            # Student dashboard, assessment, portfolio, careers
│   ├── teacher/            # Teacher dashboard and student views
│   └── admin/              # Admin panel (users, classes, subjects, reports)
├── components/
│   ├── home/               # Landing page sections (Hero, Features, HowItWorks, CTA)
│   ├── dashboard/          # Dashboard section components
│   ├── portfolio/          # Portfolio builder sections
│   ├── auth/               # Auth layout and utility components
│   ├── layout/             # Navbar and Footer
│   └── ui/                 # Shared UI components
└── lib/
    ├── supabase/           # Supabase client and server helpers
    ├── api.ts              # API utility functions
    ├── auth/               # Role-based access helpers
    ├── assessmentQuestions.ts
    ├── subjects.ts
    └── normalise.ts
```

## Roles

The app has three user roles, each with their own dashboard:

| Role | Route | Access |
|------|-------|--------|
| Student | `/student` | Assessment, career matches, portfolio |
| Teacher | `/teacher` | View and manage assigned students |
| Admin | `/admin` | Full access — users, classes, subjects, reports |

## Key Features

- **Psychometric Assessment** — multi-section questionnaire covering aptitudes, interests, personality, values, and work style
- **Career Matching** — deterministic ranking algorithm generating personalised career recommendations
- **Portfolio Builder** — students document projects and experiences, exportable as PDF
- **Role-based Dashboards** — separate views and permissions for students, teachers, and admins
- **AI-powered Analysis** — follow-up questions and profile analysis via AI
