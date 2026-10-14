# Snapbook API 📸💸

Production-ready REST API built with NestJS 10+ and TypeScript (strict mode) for mobile income and expense tracking by reading Thai bank transfer slips (images) with Google Gemini AI.

---

## 🌟 Key Features

- **Custom Schema (`slipsum`)**: Fully configured to use the custom PostgreSQL database schema `slipsum` in Supabase with RLS policies, indexes, and custom summary function.
- **Self-Contained Authentication**: The mobile/web frontend talks **only** to this API. Authentication (registration, login, refresh, logout, password reset) is completely handled here via an isolated per-request Supabase anonymous client factory.
- **Thai Bank Slip OCR & Extraction**: Powered by Google Gemini API (`@google/genai`) with strict structured JSON schema extraction.
- **Thai Banking Domain Support**: Works with slips from KBank, SCB, Krungthai NEXT, Bangkok Bank, Krungsri, TTB, GSB, PromptPay, and TrueMoney Wallet.
- **Buddhist Era (พ.ศ.) Conversion**: Automatically converts Thai Buddhist years (e.g., 2567 -> 2024, 2568 -> 2025) into ISO 8601 with `Asia/Bangkok` timezone (`+07:00`).
- **Fuzzy Account Matching & Type Detection**: Intelligently determines `expense` vs `income` by matching sender/receiver against the user's registered `own_accounts`, ignoring titles (นาย/นาง/นางสาว/Mr/Ms) and comparing masked last 4 digits (`xxx-x-x1234`).
- **Thai Category Suggestion Engine**: Automatically suggests categories using Thai keyword rules (`7-Eleven/ร้าน/food` -> อาหาร, `BTS/MRT/Grab` -> เดินทาง, `การไฟฟ้า/AIS` -> บิล/ค่าน้ำไฟ).
- **Postgres Defense-in-Depth Security**: Supabase Auth verification via global `AuthGuard`, per-user filtering on every query, and full Row Level Security (RLS) policies on `slipsum` schema.
- **Database-Level Monthly Summary**: Calculated entirely inside PostgreSQL using a custom function (`slipsum.get_monthly_summary`)—zero in-memory floating point math.
- **Production Quality**: Global Thai exception filter, rate limiting with `@nestjs/throttler` (login 5/min, forgot-password 3/min, slips 10/min), OpenAPI Swagger docs at `/docs`, and ready for 1-click deployment on Render.

---

## 🗄️ Supabase Setup Guide

### 1. Enable `slipsum` in Supabase Data API (Exposed Schemas)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your project -> **Project Settings** -> **API**.
2. Scroll to **Data API Settings (Exposed schemas)**.
3. Add **`slipsum`** to the exposed schemas list (e.g., `public, slipsum`).
4. Click **Save**.

### 2. Execute SQL Migration
1. Go to **SQL Editor** in your Supabase dashboard.
2. Open [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql) and paste the entire SQL content.
3. Click **Run**.
   - Creates the schema `slipsum` (if not already created) and sets permissions for Supabase roles.
   - Creates tables `slipsum.own_accounts`, `slipsum.categories`, `slipsum.slips`, and `slipsum.transactions`.
   - Seeds default Thai categories under `slipsum.categories`.
   - Enables RLS policies for defense-in-depth on all tables in `slipsum`.
   - Installs the stored function `slipsum.get_monthly_summary(p_user_id, p_month)`.

### 3. Create Private Storage Bucket
1. Go to **Storage** in your Supabase dashboard.
2. Click **New bucket**.
3. Set bucket name to: `slips`.
4. Ensure **Public bucket** is **OFF (Private)**.
5. Click **Save**.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
SUPABASE_ANON_KEY=eyJh...

# Supabase Database Schema (Default: slipsum)
SUPABASE_DB_SCHEMA=slipsum

# Auth Configuration
AUTH_REQUIRE_EMAIL_CONFIRM=false
FRONTEND_URL=http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

# CORS Settings (comma-separated or * for all)
CORS_ORIGINS=*

# Server Port
PORT=3000
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start development server
npm run start:dev

# 4. Open Swagger Documentation
# Navigate to http://localhost:3000/docs
```

---

## 📋 Full API Reference

Base URL: `/` (Swagger UI at `/docs`)

### Authentication Endpoints

All session responses have the shape:
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "v1.Mrh...",
  "expires_at": 1718000000,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "สมชาย"
  }
}
```

| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | **Public** | Standard | Register user (`email`, `password`, `display_name`). If `AUTH_REQUIRE_EMAIL_CONFIRM=false`, logs in immediately. |
| `POST` | `/auth/login` | **Public** | **5 / min** | Login with email and password. Returns session. |
| `POST` | `/auth/refresh` | **Public** | Standard | Refresh session with `{ refresh_token }`. |
| `POST` | `/auth/logout` | **Bearer** | Standard | Revoke access session and token. |
| `POST` | `/auth/forgot-password` | **Public** | **3 / min** | Send reset password link to email. Returns identical 200 for security. |
| `POST` | `/auth/reset-password` | **Public** | Standard | Reset password with `{ access_token, new_password }`. |
| `PATCH` | `/auth/password` | **Bearer** | Standard | Change password with `{ current_password, new_password }`. |

### App Endpoints

Include `Authorization: Bearer <access_token>` in headers for all protected endpoints. If the token is expired, the API returns `401 Unauthorized` with `error: "TOKEN_EXPIRED"` to prompt a token refresh.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | **Public** | Health check (wakes Render instance from sleep) |
| `GET` | `/me` | **Bearer** | Current user info (`id`, `email`, `display_name`) & `has_registered_accounts` |
| `GET` | `/own-accounts` | **Bearer** | List user's registered bank accounts |
| `POST` | `/own-accounts` | **Bearer** | Register a bank account (`bank_name`, `account_name`, `account_number_last4`) |
| `GET` | `/own-accounts/:id` | **Bearer** | Get specific own account details |
| `PATCH` | `/own-accounts/:id` | **Bearer** | Update own account |
| `DELETE` | `/own-accounts/:id` | **Bearer** | Delete own account |
| `GET` | `/categories` | **Bearer** | List categories (system defaults + user created) |
| `POST` | `/categories` | **Bearer** | Create custom category (`name`, `type`, `icon`, `color`) |
| `PATCH` | `/categories/:id` | **Bearer** | Update user's category (system defaults protected) |
| `DELETE` | `/categories/:id` | **Bearer** | Delete user's category (system defaults protected) |
| `POST` | `/slips` | **Bearer** | Upload up to 10 slips (multipart `files`, max 5MB each, jpeg/png/webp) |
| `GET` | `/slips/:id/image` | **Bearer** | Get 10-minute signed URL for slip image in private bucket |
| `GET` | `/transactions` | **Bearer** | Paginated transactions (`from`, `to`, `type`, `category_id`, `status`, `search`, `page`, `limit`) |
| `POST` | `/transactions` | **Bearer** | Manual transaction entry (`status: confirmed`) |
| `PATCH` | `/transactions/:id` | **Bearer** | Update transaction (automatically marks as `confirmed`) |
| `POST` | `/transactions/confirm-bulk` | **Bearer** | Bulk confirm pending review transactions (`{ ids: [] }`) |
| `DELETE` | `/transactions/:id` | **Bearer** | Delete transaction & cascade delete slip image from storage |
| `GET` | `/summary` | **Bearer** | Monthly summary & comparison computed in SQL (`?month=YYYY-MM`) |

---

## 🧪 Unit Testing

Run unit tests verifying the type-detection matcher, Buddhist-year date conversion, category keyword rules, and Supabase auth error mapping:

```bash
npm test
```
