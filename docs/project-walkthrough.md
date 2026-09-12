# Interview Preparation Tracker

## Overview
The Interview Preparation Tracker is a comprehensive, full-stack Next.js web application designed to help software engineers systematically prepare for technical interviews. It serves as a unified dashboard for tracking Data Structures and Algorithms (DSA) progress, System Design concepts, Behavioral Questions, Mock Interviews, and overall study goals.

## Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (CSS Variables) with Tailwind-like utility classes
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Session-based)
- **Icons:** Lucide React
- **Charts:** Recharts

## Data Flow & Core Features

### 1. Database Schema
The database uses Prisma and defines several core entities:
- **User:** Authentication and profile data.
- **DSAProblem:** Tracks LeetCode/GFG problems, difficulty, pattern, status, and spaced-repetition confidence.
- **SystemDesignTopic:** Tracks distributed systems concepts and case studies.
- **InterviewQuestion:** A massive, seeded question bank (over 2,800 questions) categorized by Java, SpringBoot, SQL, System Design, and Behavioral topics.
- **StudyPlan & UserStudyPlan:** Pre-defined curriculums (e.g., 8-Week DSA) and user enrollment tracking.
- **Project & ProjectLog:** Portfolio tracking with GitHub commit synchronization.
- **Journal & Goal:** Daily reflection and long-term goal tracking.

### 2. Frontend Components
The UI is built with a custom design system heavily utilizing CSS variables for theme consistency (Dark mode default).
- **`Sidebar` & `MobileNav`**: Global navigation bridging all 11 core modules.
- **`GlobalTimer`**: A persistent floating pill component that polls `/api/timer` to show active study session duration across all pages.
- **`AnalyticsCharts`**: Recharts implementations for visualizing topic distribution (Pie Chart) and daily activity (Stacked Bar Chart).
- **`Mock Interview Simulator`**: A stateful React component (`mock-interview/page.tsx`) that acts as a flashcard quiz, sequentially serving randomized questions from the bank and allowing users to reveal answers and grade their confidence.

### 3. API & Backend Flow
The application uses the Next.js `app/api` folder to expose RESTful endpoints.
- **Pagination & Optimization:** Endpoints like `/api/interview-questions` use Prisma's `skip` and `take` to paginate thousands of records, preventing browser memory exhaustion.
- **Spaced Repetition:** The `/review` endpoints update the `reviewAt` timestamp based on user-submitted confidence scores (1-5 stars), scheduling the next review date exponentially further into the future.
- **Data Ingestion:** The `scripts/` directory contains Node.js scripts (`pdf-parse`, `xlsx`) used to parse gigabytes of unstructured PDFs and Excel files into clean JSON, which was then seeded into the Neon database.

### 4. GitHub Integration
The `/api/projects/[id]/github-sync` endpoint takes a GitHub repository URL and a Personal Access Token (`GITHUB_TOKEN` in `.env`), fetches the latest commits via the GitHub REST API, and converts them into `ProjectLog` entries.

## Walkthrough

### Dashboard (`/dashboard`)
The landing page provides a birds-eye view of your progress. It displays active timers, total problems solved, upcoming reviews (spaced repetition), and daily journal streaks.

### Study Plans (`/study-plans`)
Enroll in predefined curriculums like the "12-Week Complete Interview Prep". Progress is tracked at a phase level (e.g., Week 1: Arrays & Hashing).

### DSA Tracker (`/dsa`)
A powerful, paginated table (desktop) and card list (mobile) of algorithms. Filter by Topic, Difficulty, and Status. Click the `★` to rate your confidence on a solved problem and schedule it for review.

### System Design (`/system-design`)
Split into Topics (Concepts like CAP Theorem, Consistent Hashing) and Case Studies (Design Twitter, Design Uber). Tracks progress via sliders (0-100%).

### Interview Q&A (`/interview-questions`)
Browse the massive 2,800+ question bank extracted from curated PDFs. Use the categorical filters or search bar to narrow down topics.

### Mock Interview (`/mock-interview`)
The ultimate test. Generates a random session of 5 questions across all categories. Read the question, speak your answer aloud, reveal the suggested answer, and grade yourself.

### Projects (`/projects`)
Track your portfolio. Open a project to see a timeline of work logs. Click "Sync Commits" to automatically pull your latest GitHub activity into the timeline.

## Setup Instructions
1. Install dependencies: `npm install`
2. Configure `.env`: Provide `DATABASE_URL` (PostgreSQL), `NEXTAUTH_SECRET`, and `GITHUB_TOKEN`.
3. Push schema: `npx prisma db push`
4. Generate Prisma Client: `npx prisma generate`
5. Start server: `npm run dev`
6. Build for production: `npm run build` && `npm start`
