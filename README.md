# KAM Migration Prep

A web-only migration prep platform with a Resume Builder, recruiter-ready document exports, and a self-contained IELTS General / CLB9 learning app for a 180-day study plan.

## Stack

- Next.js web app at the project root
- SQLite local storage for users, resumes, and learning progress
- API routes in `app/api`
- Local TypeScript types in `lib`
- JSON curriculum and local SVG images in `content` and `public/images`

## Quick Start

```bash
npm install
npm run generate:content
npm run dev
```

The web app runs on `http://localhost:3000`.

## Features

- Email/password registration and login
- Resume Builder with structured profile data
- CV, cover letter, and email template exports as `md`, `docx`, and `pdf`
- CLB9 learning dashboard with completed-day tracking and notes

## Content

The app does not depend on external IELTS resources for the main study path. The generated JSON includes:

- 180 daily lessons
- 3,600 vocabulary records
- 60 grammar lessons
- 180 listening lessons with scripts and questions
- 120 reading passages
- 180 writing tasks
- 180 speaking sets
- 180 daily quizzes
- Local SVG illustrations for lessons, vocabulary, and grammar topics
