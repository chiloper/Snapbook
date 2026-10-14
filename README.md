# Snapbook 📸💸

A unified monorepo for income & expense tracking by reading Thai bank transfer slips (images) with Google Gemini AI.

- **`/web`**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Chart.js frontend.
- **`/api`**: NestJS 10+ REST API with `@google/genai` OCR, Supabase Auth, and custom `slipsum` database schema.
- **Unified Deployment**: Deploy both frontend and backend together in a single Node.js service on [Render](https://render.com) using `render.yaml`.

---

## 📁 Monorepo Structure

```text
Snapbook/
├── api/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Self-contained Supabase Auth endpoints
│   │   ├── categories/     # System and custom category manager
│   │   ├── common/         # Auth guards, decorators, global exception filters
│   │   ├── extraction/     # Gemini AI slip OCR, fuzzy account matcher, Buddhist year
│   │   ├── health/         # Render healthcheck endpoint
│   │   ├── me/             # Profile & user registration status
│   │   ├── own-accounts/   # User bank account management (4 last digits matching)
│   │   ├── slips/          # Multi-image slip upload & storage
│   │   ├── summary/        # Monthly analytics via Postgres RPC
│   │   ├── supabase/       # Supabase client factory (slipsum schema)
│   │   └── transactions/   # CRUD, pagination, and bulk review confirm
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── web/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── accounts/   # Bank account management page
│   │   │   ├── categories/ # Category management page
│   │   │   ├── login/      # Sign-in page
│   │   │   ├── register/   # Sign-up page
│   │   │   ├── slips/      # Slip multi-upload & OCR real-time review page
│   │   │   ├── transactions/ # Transaction manager & bulk confirm page
│   │   │   ├── layout.tsx  # Root layout with responsive Navbar & AuthProvider
│   │   │   └── page.tsx    # Monthly Dashboard (KPIs, Charts, Recent transactions)
│   │   ├── components/     # UI components (Navbar, modals, badges)
│   │   ├── context/        # AuthContext with automatic refresh token
│   │   └── lib/            # Axios client with auto TOKEN_EXPIRED interception
│   ├── next.config.js      # Internal API rewrite proxy (/api-backend -> NestJS)
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # Schema, RLS, functions, seed categories
├── package.json            # Monorepo root scripts
├── render.yaml             # Render deployment configuration
└── start-all.js            # Monorepo process runner (spawns API + Next.js)
```

---

## 🌟 Key Features

1. **Next.js Frontend (`/web`)**:
   - Modern Dashboard with monthly income/expense summary, cashflow bar chart, and category donut chart.
   - Slip upload dropzone supporting up to 10 images at once with real-time status and instant OCR review badges.
   - Transaction list with review filter (`รอตรวจสอบ` vs `ทั้งหมด`), search, manual entry modal, and bulk confirm button.
   - Bank accounts manager for registering personal account numbers (4 last digits) to automatically determine income vs expense.
   - Category manager for both system defaults and custom user categories.

2. **NestJS Backend (`/api`)**:
   - Structured slip extraction using `@google/genai` (Gemini 2.5 Flash).
   - Thai Buddhist Era conversion (พ.ศ. 2567 -> 2024) with `Asia/Bangkok` timezone.
   - Fuzzy account matching ignoring titles (นาย/นาง/นางสาว/Mr/Ms).
   - Stored Postgres procedure `slipsum.get_monthly_summary` for instant floating-point-safe monthly aggregation.

3. **Zero CORS Friction in Production**:
   - Next.js proxies `/api-backend/:path*` directly to the local NestJS port `3001` via `next.config.js` rewrites.
   - Swagger documentation is available directly at `/docs`.

---

## 🚀 Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Build both projects
npm run build

# 3. Run both web and api simultaneously
npm start

# Or develop individually:
# In one terminal:
cd api && npm run start:dev   # Runs on http://localhost:3001
# In another terminal:
cd web && npm run dev          # Runs on http://localhost:3000
```

---

## ☁️ Deploy to Render

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint:
- **Runtime**: `node`
- **Plan**: `free`
- **Region**: `singapore`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`

### Environment Variables on Render
Set the following environment variables in the Render Dashboard:
- `SUPABASE_URL`: Your Supabase HTTPS URL (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key
- `SUPABASE_ANON_KEY`: Anon / public API key
- `SUPABASE_DB_SCHEMA`: `slipsum`
- `GEMINI_API_KEY`: Google AI Studio Gemini API Key
- `GEMINI_MODEL`: `gemini-2.5-flash`
