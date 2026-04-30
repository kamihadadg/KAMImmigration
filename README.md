# KAM Migration Prep (KAMCLB9)

A **web-only** migration preparation platform: a **Resume Builder** with recruiter-ready exports, **work and university target** lists (user-facing and admin-editable), and a self-contained **IELTS General / CLB9** learning path for a **180-day** study plan. Dashboards split **work**, **study**, and **language** so admission, employment, and English prep stay in one account.

**Default UI language:** English. **Also available:** Persian (`fa`), RTL-ready, with UI strings in `messages/en.json` and `messages/fa.json`.

---

## Table of contents

- [Highlights](#highlights)
- [What you get (three tracks)](#what-you-get-three-tracks)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Data & files on disk](#data--files-on-disk)
- [Repository layout](#repository-layout)
- [Main routes (map)](#main-routes-map)
- [Credits](#credits)
- [Content generation](#content-generation)
- [Content & privacy](#content--privacy)
- [Production build](#production-build)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Highlights

| Area | What the app does |
|------|-------------------|
| **Auth & profile** | Email/password registration, login, profile (name/email), security page, sign-out. |
| **Resume Builder** | Structured job CV and academic CV data, dedicated editors, SQLite persistence. |
| **Exports** | CV, cover letter, and email-style outputs as **Markdown**, **DOCX**, and **PDF** (API routes under `app/api/resume-builder/export/`). |
| **CLB9 learning** | Daily lessons, vocabulary, grammar, listening, reading, writing, speaking, quizzes; completed days and notes stored per user. |
| **Internationalization** | Locale from cookies; `lib/i18n` + `messages/*.json`; fonts tuned for Farsi in layout. |
| **Targets** | `/targets` — work send-lists and university lists by **country** (and **field** for universities). Seeds in `lib/resume-builder/targets.ts`; admins can persist overrides. |
| **Admin** | `/admin` (options, targets) when the signed-in email is allow-listed (see [Configuration](#configuration)). |

---

## What you get (three tracks)

1. **Work migration** — Job CV, cover letter, employer/recruiter-oriented copy, exports, and **work targets** (where to send applications by destination).
2. **Study migration** — Academic CV (research, publications, teaching, references), formal text, and **university targets** (institutions by country/field, with optional ranking notes in seed data).
3. **Language & CLB9** — A **180-day** path aligned with IELTS General-style skills practice; progress lives beside resumes in the same SQLite-backed account.

The **dashboard hub** (`/dashboard`) links three workspaces: **Job & migration**, **Academic CV**, and **Language & CLB9**.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js](https://nextjs.org/) (App Router), React |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — file `data/resume-builder.sqlite` |
| Validation | [Zod](https://zod.dev/) |
| Auth session | Signed cookies; secret from env (below) |
| Documents | [docx](https://www.npmjs.com/package/docx), [PDFKit](https://pdfkit.org/) |
| Passwords | [bcryptjs](https://www.npmjs.com/package/bcryptjs) |

Server modules and shared logic: `lib/`. Curriculum JSON: `content/` (generated). Static lesson art: `public/images/`.

---

## Prerequisites

- **Node.js** 18+ (use **20+** if your Next.js version recommends it).
- **npm** (bundled with Node).
- **Native build toolchain** for `better-sqlite3` where prebuilds are missing (common on fresh Windows/macOS/Linux dev machines). Install [build tools for Node](https://github.com/nodejs/node-gyp#installation) if `npm install` fails on the SQLite binding.

---

## Quick start

```bash
git clone <your-repo-url>
cd KAMCLB9
npm install
npm run generate:content
npm run dev
```

Open **http://localhost:3000** (dev server uses port **3000** per `package.json`).

Run `npm run generate:content` after clone and whenever you change `scripts/generate-content.mjs`, so `content/*.json` stays in sync.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server on port **3000** |
| `npm run build` | Production build |
| `npm run start` | Production server on port **3000** |
| `npm run lint` | `next lint` |
| `npm run generate:content` | Regenerate curriculum JSON under `content/` |

---

## Configuration

Optional environment variables (e.g. `.env.local` for Next.js):

| Variable | Purpose |
|----------|---------|
| `RESUME_BUILDER_SECRET` or `NEXTAUTH_SECRET` | Secret used to sign session cookies. If unset, a **development fallback** is used — **set a strong secret in production**. |
| `RESUME_ADMIN_EMAILS` | Comma-separated admin emails. Accounts using these addresses can open `/admin` and related admin APIs. |

Cookie `secure` follows `NODE_ENV === "production"`.

---

## Data & files on disk

| Path | Role |
|------|------|
| `data/resume-builder.sqlite` | Users, resumes, credits, learning progress, target overrides, etc. Created on first use. |
| `data/*.sqlite-*` | SQLite WAL sidecar files when WAL mode is active. |

These paths are **gitignored** (see `.gitignore`). Back up the `data/` folder if you care about user content.

---

## Repository layout

```
app/
  page.tsx              Landing (study / work / language messaging)
  dashboard/            Hub + work / study / language sub-dashboards
  learn/                CLB9 path (by day)
  language/             Alternate language UI routes
  login/, register/, profile/, security/
  resume-builder/       Full resume builder + admin under /resume-builder
  resume/               Shorter resume entry points
  targets/              User targets (work | universities)
  admin/                App-level admin (options, targets)
  api/                  Learning progress, resume export, etc.
components/             Global nav, shell, lesson workspace, resume-builder UI
content/                Generated JSON (lessons, quizzes, vocabulary, …)
lib/
  i18n/                 Locale + `t()` + message loading
  resume-builder/       DB schema, auth, targets, options, renderers
  learning/             Progress helpers
messages/               en.json, fa.json (all user-facing copy for i18n)
public/images/          Local SVGs referenced from generated content
scripts/generate-content.mjs   Builds `content/*.json`
```

---

## Main routes (map)

| Path | Notes |
|------|--------|
| `/` | Marketing / overview, sign-up CTAs |
| `/dashboard` | Choose work / study / language workspace |
| `/dashboard/work`, `/dashboard/study`, `/dashboard/language` | Track-specific entry |
| `/learn`, `/learn/day/[day]` | CLB9 daily flow |
| `/targets` | Work and university targets (`?kind=work` \| `universities`) |
| `/resume-builder/*` | Builder, editors, dashboard, login/register |
| `/admin`, `/admin/targets`, `/admin/options` | Admin UI (email allow-list) |
| `/profile`, `/security` | Account |

Exact strings and labels depend on locale; keys live in `messages/*.json`.

---

## Credits

Starter balance and rules are defined in app config (`DEFAULT_STARTING_CREDITS`, etc.). Typical use: **new resumes**, **exports**, and **unlocking new lesson days** consume credits; users can **request more credits** from the UI (admin workflow depends on how you operate the deployment).

---

## Content generation

`scripts/generate-content.mjs` produces large JSON files under `content/`, including (for example):

- **180** daily lesson bundles  
- Thousands of **vocabulary** records  
- **Grammar**, **listening**, **reading**, **writing**, **speaking**, **quizzes**  
- References to **local** SVG assets under `public/images/`

CI/CD: run `npm run generate:content` **before** `npm run build` if the build expects `content/` to exist (fresh clones).

---

## Content & privacy

- The **main study path** does not depend on external IELTS HTTP APIs for core curriculum delivery.
- **PII and progress** stay on the server filesystem in SQLite unless you add backups/sync yourself. This suits **local** or **self-hosted** use; it is not a multi-tenant SaaS database story out of the box.

---

## Production build

```bash
npm run generate:content
npm run build
npm run start
```

Set `RESUME_BUILDER_SECRET` (or `NEXTAUTH_SECRET`) and `RESUME_ADMIN_EMAILS` in the host environment.

---

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| `npm install` fails on `better-sqlite3` | Install platform build prerequisites for `node-gyp`; retry. |
| Empty or missing lessons | Run `npm run generate:content` and confirm `content/*.json` exist. |
| Admin pages 403 / not visible | Sign in with an email listed in `RESUME_ADMIN_EMAILS`. |
| Lost user data | Restore `data/resume-builder.sqlite` from backup. |

---

## License

This repository is marked **private** in `package.json`. Add a `LICENSE` file when you publish or open-source the project on GitHub.
