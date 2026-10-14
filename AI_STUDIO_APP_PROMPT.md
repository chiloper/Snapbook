# Master Prompt สำหรับสั่ง Google AI Studio สร้าง Frontend Mobile App "Snapbook"

คัดลอกข้อความด้านล่างนี้ทั้งหมด แล้วนำไปวางใน **Google AI Studio** (แนะนำโมเดล **Gemini 1.5 Pro** หรือรุ่นล่าสุด ปรับ `System Instructions` หรือวางในช่อง Prompt ได้เลยครับ)

---

```markdown
You are a Staff Mobile Engineer specializing in React Native (Expo, TypeScript) and modern UI/UX design.
Build a production-ready mobile application named "Snapbook" (แอปบันทึกรายรับ-รายจ่ายอัตโนมัติจากการอ่านสลิปธนาคารไทยด้วย AI).

The backend REST API is already fully developed, deployed, and live. Your task is to build the complete frontend client code that communicates exclusively with this REST API.

---

### 🌐 Backend API Specifications
- **Base URL**: `https://snapbook-api.onrender.com` (Configurable via `.env` `EXPO_PUBLIC_API_URL`)
- **Health Check**: `GET /health` (Public, call on Splash Screen to wake Render free tier from sleep)
- **Authentication**: Bearer Token in `Authorization: Bearer <access_token>` header.
- **Token Expiration Handling**: When an access token expires, API responds with HTTP 401 and JSON `{ "statusCode": 401, "message": "...", "error": "TOKEN_EXPIRED" }`. The frontend Axios/fetch interceptor MUST automatically catch `TOKEN_EXPIRED`, call `POST /auth/refresh` with `{ refresh_token }`, save the new tokens, and transparently retry the failed request.

#### Complete Endpoints Contract:
1. **Authentication**:
   - `POST /auth/register` { email, password (min 8), display_name } -> returns Session
   - `POST /auth/login` { email, password } -> returns Session (Rate limit: 5/min)
   - `POST /auth/refresh` { refresh_token } -> returns new Session
   - `POST /auth/logout` (Bearer auth) -> revokes refresh token
   - `POST /auth/forgot-password` { email } -> sends reset email
   - `POST /auth/reset-password` { access_token, new_password }
   - `PATCH /auth/password` (Bearer auth) { current_password, new_password }
   - Session Response Shape: `{ access_token, refresh_token, expires_at, user: { id, email, display_name } }`
2. **User Profile**:
   - `GET /me` -> `{ id, email, display_name, has_registered_accounts: boolean, account_count: number }`
3. **Own Accounts (สำหรับให้ AI แยกรายรับ/รายจ่าย)**:
   - `GET /own-accounts`
   - `POST /own-accounts` { bank_name, account_name, account_number_last4 }
   - `PATCH /own-accounts/:id`
   - `DELETE /own-accounts/:id`
4. **Slip OCR Upload (ฟีเจอร์หลัก)**:
   - `POST /slips` (multipart/form-data, field: `files`, up to 10 images, max 5MB each, jpeg/png/webp)
   - Response: Array of `{ file_name, result: 'created'|'duplicate'|'failed', transaction?, slip_id, message?, needs_type_review? }`
   - `GET /slips/:id/image` -> returns 10-minute signed URL `{ signed_url, expires_in }`
5. **Transactions**:
   - `GET /transactions?from=&to=&type=&category_id=&status=&search=&page=&limit=` (paginated, newest first)
   - `POST /transactions` (Manual entry, status: confirmed)
   - `PATCH /transactions/:id` (Edit fields; automatically marks status confirmed)
   - `POST /transactions/confirm-bulk` { ids: string[] }
   - `DELETE /transactions/:id` (Cascades to delete slip image from storage)
6. **Categories**:
   - `GET /categories` (System defaults + user created)
   - `POST /categories` { name, type: 'income'|'expense', icon, color }
   - `PATCH /categories/:id`, `DELETE /categories/:id` (User categories only)
7. **Monthly Summary Dashboard**:
   - `GET /summary?month=YYYY-MM` (Calculated in SQL)
   - Returns: `{ total_income, total_expense, net, total_fee, count, by_category: [{category_id, name, color, type, total, percent}], daily: [{date, income, expense}], compared_to_last_month: { income_change_pct, expense_change_pct } }`

---

### 📱 App Structure & User Experience (UX/UI)
Design a sleek, modern, iOS/Android mobile interface using Tailwind CSS (NativeWind) or StyleSheet, featuring:
- **Primary Colors**: Income Emerald Green (`#10B981`), Expense Rose Red (`#EF4444`), Brand Indigo (`#6366F1`), Neutral Slate (`#0F172A`).
- **Thai Typography**: Prompt or Sarabun font styling with clear number formatting (e.g., `฿1,500.00`).

#### 1. Splash & Auth Flow:
- Splash Screen calls `GET /health` to wake server. If valid tokens exist in SecureStore, auto-navigate to Main App; otherwise navigate to Login.
- Beautiful Login and Register screens with show/hide password, error banners with Thai error messages, and "Forgot Password" modal.

#### 2. Dashboard Screen (Home):
- Current month selector (e.g. `ตุลาคม 2026`) with `<` and `>` buttons.
- Net Balance card, Total Income card, Total Expense card with percentage change badges (+12.5% vs last month).
- Warning Banner if `has_registered_accounts === false`: "กรุณาผูกบัญชีธนาคารของคุณ เพื่อให้ระบบแยกสลิปเงินเข้า/เงินออกได้แม่นยำ" with button to navigate to Own Accounts.
- Category Breakdown: Interactive Donut / Pie Chart using category colors, listing percentages and totals.
- Daily Cashflow: Bar chart showing daily income vs expense for the month.
- Quick FAB (Floating Action Button): "+ บันทึก" (Select: "อัปโหลดสลิป" or "คีย์รายการเอง").

#### 3. Slip Scanner & Multi-Upload Flow:
- Image Picker supporting multi-selection (up to 10 slip photos at once) or Camera capture.
- Upload Progress indicator.
- Results Modal/Screen displaying list of parsed slips:
  - Success badges (`บันทึกแล้ว`, `สลิปซ้ำ`, `ไม่ผ่าน`).
  - Warning tag if `needs_type_review === true`: "ตรวจเช็ครายรับ/รายจ่าย".
  - Tap any slip to view original slip image preview via signed URL modal.

#### 4. Transactions List Screen:
- Top Segmented Tabs: `รอตรวจสอบ (Pending Review)` vs `ทั้งหมด (All)`.
- Search bar (by payee name, note, ref code).
- Filter sheet (by date range, type, category).
- "ยืนยันทั้งหมด (Confirm All)" button when on Pending Review tab.
- Transaction Card: Counterparty name, bank name, category pill, formatted amount, date. Swipe right to confirm, swipe left to delete.
- Tap card to open Edit Modal (adjust amount, category, note).

#### 5. My Accounts & Categories Screen:
- List user's registered bank accounts with bank logo / badge and masked last 4 digits (`xxx-x-x1234`).
- Add / Delete bank account modal.
- List Categories grouped by Income and Expense with icon and color tag. Ability to create custom categories.

---

### 💻 Deliverables
Please generate the complete, production-ready codebase including:
1. `src/api/client.ts`: Axios instance with token management (SecureStore), request interceptor, and response interceptor for `TOKEN_EXPIRED` auto-refresh.
2. `src/api/auth.ts`, `src/api/slips.ts`, `src/api/transactions.ts`, `src/api/summary.ts`, `src/api/categories.ts`, `src/api/accounts.ts`.
3. Navigation structure with React Navigation (Native Stack + Bottom Tabs).
4. State management (Zustand or React Query / TanStack Query for optimal caching and pull-to-refresh).
5. All Screens: `SplashScreen`, `LoginScreen`, `RegisterScreen`, `HomeScreen`, `UploadSlipsScreen`, `TransactionsScreen`, `AccountsScreen`, `CategoriesScreen`.
6. Beautiful components: `SummaryCard`, `SlipResultCard`, `TransactionItem`, `CategoryBadge`, `MonthPicker`.

Provide clean, modular, and fully typed TypeScript code ready to run with `npx expo start`.
```
