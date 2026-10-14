# Snapbook 📸💸

A modern income & expense tracking application by reading Thai bank transfer slips (images) with Google Gemini AI.

- **`/web`**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + Chart.js, deployed automatically to **GitHub Pages**.
- **`/api`**: NestJS 10+ REST API with `@google/genai` OCR, Supabase Auth, and custom `slipsum` database schema, deployed to **Render** with Smart Build Filters.

---

## 📁 Project Architecture

```text
Snapbook/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml  # GitHub Actions CI/CD to build & deploy Next.js to GitHub Pages
├── api/                      # NestJS Backend API (Render Web Service)
│   ├── src/
│   │   ├── auth/             # Supabase Auth endpoints (Register, Login, Refresh, Logout)
│   │   ├── categories/       # Category manager (system defaults & custom user categories)
│   │   ├── extraction/       # Gemini 2.5 Flash OCR, fuzzy account matcher, Buddhist year
│   │   ├── health/           # Healthcheck endpoint for Render
│   │   ├── own-accounts/     # User bank account management (4 last digits matching)
│   │   ├── slips/            # Multi-image slip upload & storage
│   │   ├── summary/          # Monthly analytics via Postgres RPC
│   │   ├── supabase/         # Supabase client factory (slipsum schema)
│   │   └── transactions/     # CRUD, pagination, and bulk review confirm
│   ├── package.json
│   └── tsconfig.json
├── web/                      # Next.js 14 Frontend Application (GitHub Pages)
│   ├── src/
│   │   ├── app/
│   │   │   ├── accounts/     # Bank account management page
│   │   │   ├── categories/   # Category management page
│   │   │   ├── login/        # Sign-in page
│   │   │   ├── register/     # Sign-up page
│   │   │   ├── slips/        # Slip multi-upload & OCR real-time review page
│   │   │   ├── transactions/ # Transaction manager & bulk confirm page
│   │   │   ├── layout.tsx    # Root layout with responsive Navbar & AuthProvider
│   │   │   └── page.tsx      # Monthly Dashboard (KPIs, Charts, Recent transactions)
│   │   ├── components/       # UI components (Navbar, modals, badges)
│   │   ├── context/          # AuthContext with automatic refresh token
│   │   └── lib/              # Axios client with auto TOKEN_EXPIRED interception & dynamic API URL
│   ├── next.config.js        # Static export configuration for GitHub Pages
│   └── package.json
├── render.yaml               # Render blueprint with buildFilter (only builds api/**)
└── package.json              # Monorepo scripts for local development
```

---

## 🌐 1. Deploy Frontend to GitHub Pages

The repository contains an automated GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and deploys `/web` as a static site whenever changes are pushed to `web/**`.

### Setup Steps on GitHub:
1. Go to your repository on GitHub -> **Settings** -> **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. (Optional) Set your Render API URL:
   - Go to **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**.
   - Click **New repository variable**.
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://snapbook-api.onrender.com` (your Render service URL).
   - If not set, it defaults to `https://snapbook-api.onrender.com`.

---

## ⚡ 2. Deploy API to Render with Build Filters

The API is configured via [`render.yaml`](./render.yaml) with `buildFilter`:
- **Root Directory**: `api`
- **Build Filter**: Render will **only** trigger builds when files in `api/**` change.
- Changes to `web/**`, `.github/**`, or markdown files will **not** trigger a rebuild on Render, saving build minutes and compute time!

```yaml
services:
  - type: web
    name: snapbook-api
    runtime: node
    plan: free
    region: singapore
    rootDir: api
    buildCommand: npm ci --include=dev && npm run build
    startCommand: node dist/main
    healthCheckPath: /health
    buildFilter:
      paths:
        - api/**
      ignoredPaths:
        - api/README.md
        - api/**/*.spec.ts
```

### Environment Variables on Render:
Configure the following in the Render Dashboard:
- `SUPABASE_URL`: Supabase project URL (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_DB_SCHEMA`: `slipsum`
- `AUTH_REQUIRE_EMAIL_CONFIRM`: `false`
- `FRONTEND_URL`: `https://chiloper.github.io`
- `GEMINI_API_KEY`: Google AI Studio Gemini API Key
- `GEMINI_MODEL`: `gemini-2.5-flash`
- `CORS_ORIGINS`: `*`

---

## 🚀 Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both locally
# Backend runs on http://localhost:3001
cd api && npm run start:dev

# In another terminal, Frontend runs on http://localhost:3000
cd web && npm run dev
```
