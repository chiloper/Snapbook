# Snapbook API — คู่มือการเชื่อมต่อสำหรับ Frontend & Mobile App

คู่มือฉบับสมบูรณ์สำหรับทีมนักพัฒนา Frontend (React Native, Flutter, Swift/iOS, Kotlin/Android, Next.js) ในการเชื่อมต่อกับ **Snapbook REST API**

---

## 📌 สารบัญ
1. [ข้อมูลทั่วไป & Base URL](#1-ข้อมูลทั่วไป--base-url)
2. [วงจรอายุ Token & Interceptor (Authentication Architecture)](#2-วงจรอายุ-token--interceptor)
3. [ระบบสมาชิก & ยืนยันตัวตน (Auth Endpoints)](#3-ระบบสมาชิก--ยืนยันตัวตน-auth-endpoints)
4. [ระบบอ่านสลิปธนาคารด้วย AI (Slip OCR Endpoints)](#4-ระบบอ่านสลิปธนาคารด้วย-ai-slip-ocr-endpoints)
5. [ระบบจัดการธุรกรรม (Transactions Endpoints)](#5-ระบบจัดการธุรกรรม-transactions-endpoints)
6. [หมวดหมู่ & บัญชีของฉัน (Categories & Own Accounts)](#6-หมวดหมู่--บัญชีของฉัน-categories--own-accounts)
7. [หน้าแดชบอร์ดสรุปผลรายเดือน (Monthly Summary)](#7-หน้าแดชบอร์ดสรุปผลรายเดือน-monthly-summary)
8. [โค้ดตัวอย่างพร้อมใช้ (TypeScript / Axios Client)](#8-โค้ดตัวอย่างพร้อมใช้-typescript--axios-client)

---

## 1. ข้อมูลทั่วไป & Base URL

| Environment | Base URL | รายละเอียด |
|---|---|---|
| **Local Development** | `http://localhost:3000` | รันบนเครื่องผู้พัฒนา |
| **Production (Render)** | `https://snapbook-api.onrender.com` | โดเมนที่ได้จาก Render |
| **Interactive Docs** | `/docs` | Swagger UI ทดสอบยิง API ผ่านเว็บ |
| **Health Check** | `GET /health` | **Public** ใช้ปลุก Server Render จากโหมด Sleep ตอนเปิดแอป |

> [!TIP]
> **เทคนิคสำหรับ Render Free Tier**: บน Render Free เครื่องจะหลับเมื่อไม่มีการใช้งาน เมื่อผู้ใช้เปิดแอปขึ้นมา ให้หน้า Splash Screen ยิง `GET /health` ล่วงหน้าทันที เพื่อปลุก Server ให้พร้อมทำงานก่อนผู้ใช้กดล็อกอิน

---

## 2. วงจรอายุ Token & Interceptor

ระบบใช้ Bearer Token ผ่าน Header:
```http
Authorization: Bearer <access_token>
```

### Response รูปแบบ Session
เมื่อผู้ใช้ล็อกอิน, ลงทะเบียนสำเร็จ, หรือรีเฟรชโทเค็น จะได้ JSON โครงสร้างนี้เสมอ:
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "v1.Mrh...",
  "expires_at": 1718000000,
  "user": {
    "id": "c61dd0da-04d3-466d-978d-ff85ad6385f0",
    "email": "user@example.com",
    "display_name": "สมชาย ใจดี"
  }
}
```

### การตรวจจับ Token หมดอายุ (Auto Refresh Token)
เมื่อ `access_token` หมดอายุ API จะตอบกลับด้วย:
- **HTTP Status**: `401 Unauthorized`
- **Error Code**: `"TOKEN_EXPIRED"`
```json
{
  "statusCode": 401,
  "message": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  "error": "TOKEN_EXPIRED"
}
```
**Frontend Workflow**:
1. ฝั่ง Frontend ดักจับ response ใน Axios Interceptor
2. หากเจอ `error === "TOKEN_EXPIRED"` ให้ส่ง `POST /auth/refresh` ด้วย `{ refresh_token }`
3. บันทึก `access_token` ใหม่ แล้ว Re-try คำขอเดิมอัตโนมัติ

---

## 3. ระบบสมาชิก & ยืนยันตัวตน (Auth Endpoints)

### 3.1 ลงทะเบียนผู้ใช้ใหม่
- **Method / Path**: `POST /auth/register` (Public)
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "display_name": "สมชาย ใจดี"
  }
  ```
- **Response (เมื่อเปิด auto confirm email)**: ได้รับ Session Object ทันที (ล็อกอินให้อัตโนมัติ)
- **Response (กรณีเปิด verify email)**:
  ```json
  {
    "requires_confirmation": true,
    "message": "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
  }
  ```

---

### 3.2 เข้าสู่ระบบ
- **Method / Path**: `POST /auth/login` (Public, Rate Limit: **5 ครั้ง/นาที**)
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Success (200 OK)**: คืนค่า Session Object
- **Error (401 Unauthorized)**:
  ```json
  {
    "statusCode": 401,
    "message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "error": "Unauthorized"
  }
  ```

---

### 3.3 รีเฟรชโทเค็น
- **Method / Path**: `POST /auth/refresh` (Public)
- **Body**:
  ```json
  {
    "refresh_token": "v1.Mrh..."
  }
  ```
- **Success (200 OK)**: คืนค่า Session Object ใหม่

---

### 3.4 ออกจากระบบ
- **Method / Path**: `POST /auth/logout` (Requires Bearer Token)
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "ออกจากระบบสำเร็จ"
  }
  ```

---

### 3.5 ลืมรหัสผ่าน & รีเซ็ตรหัสผ่าน
- **ขอรับลิงก์รีเซ็ต**: `POST /auth/forgot-password` (Rate Limit: **3 ครั้ง/นาที**)
  - Body: `{ "email": "user@example.com" }`
  - ลิงก์ในอีเมลจะ redirect กลับมาที่ `${FRONTEND_URL}/reset-password#access_token=...`
- **ตั้งรหัสผ่านใหม่**: `POST /auth/reset-password`
  - Body:
    ```json
    {
      "access_token": "<token_จาก_url>",
      "new_password": "NewSecretPassword123!"
    }
    ```

---

### 3.6 เปลี่ยนรหัสผ่าน (ผู้ใช้ที่ล็อกอินอยู่)
- **Method / Path**: `PATCH /auth/password` (Requires Bearer Token)
- **Body**:
  ```json
  {
    "current_password": "OldPassword123!",
    "new_password": "NewSecretPassword123!"
  }
  ```

---

### 3.7 ข้อมูลผู้ใช้ปัจจุบัน & สถานะการผูกบัญชี
- **Method / Path**: `GET /me` (Requires Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "c61dd0da-04d3-466d-978d-ff85ad6385f0",
    "email": "user@example.com",
    "display_name": "สมชาย ใจดี",
    "has_registered_accounts": true,
    "account_count": 2
  }
  ```
> [!NOTE]
> หาก `has_registered_accounts === false` แนะนำให้แสดงแบนเนอร์แจ้งเตือนในแอป แนะนำให้ผู้ใช้ไปตั้งค่าบัญชีของตนเองที่หน้า **Own Accounts** เพื่อให้ระบบตรวจจับสลิปว่าเป็น "รายรับ" หรือ "รายจ่าย" ได้แม่นยำ 100%

---

## 4. ระบบอ่านสลิปธนาคารด้วย AI (Slip OCR Endpoints)

### 4.1 อัปโหลดและประมวลผลสลิป
- **Method / Path**: `POST /slips` (Requires Bearer Token, Rate Limit: **10 ครั้ง/นาที**)
- **Content-Type**: `multipart/form-data`
- **Field Name**: `files` (รองรับ 1-10 ไฟล์ต่อครั้ง, ขนาดไม่เกิน 5MB ต่อไฟล์, JPG/PNG/WEBP)

#### ตัวอย่างผลลัพธ์ (Response 201 Created):
```json
[
  {
    "file_name": "slip_kbank_01.jpg",
    "result": "created",
    "slip_id": "8f5a9143-6c73-455b-b5d1-6789f66458a1",
    "needs_type_review": false,
    "transaction": {
      "id": "e81d77aa-f179-4509-8472-7634f195d2cb",
      "user_id": "c61dd0da-04d3-466d-978d-ff85ad6385f0",
      "slip_id": "8f5a9143-6c73-455b-b5d1-6789f66458a1",
      "type": "expense",
      "amount": 250.00,
      "fee": 0.00,
      "transaction_at": "2024-10-14T14:30:00+07:00",
      "bank_name": "KBank",
      "counterparty_name": "ร้านอาหารตามสั่งป้าสมใจ",
      "counterparty_account": "xxx-x-x5678",
      "transaction_ref": "20241014567891234",
      "category_id": "90ba95e5-4d54-411a-8280-5a39bfb822d5",
      "note": "ค่าอาหารกลางวัน",
      "status": "pending_review",
      "category": {
        "id": "90ba95e5-4d54-411a-8280-5a39bfb822d5",
        "name": "อาหาร",
        "icon": "utensils",
        "color": "#EF4444",
        "type": "expense"
      }
    }
  },
  {
    "file_name": "duplicate_slip.jpg",
    "result": "duplicate",
    "slip_id": "11223344-5566-7788-9900-aabbccddeeff",
    "message": "สลิปนี้ถูกบันทึกในระบบแล้ว (รหัสอ้างอิงตรงกัน)"
  },
  {
    "file_name": "not_a_slip.jpg",
    "result": "failed",
    "slip_id": "99887766-5544-3322-1100-ffeeddccbbaa",
    "message": "รูปภาพไม่ใช่สลิปโอนเงินของธนาคาร"
  }
]
```

#### สถานะ `result` ที่แอปต้องจัดการ:
1. **`created`**: สลิปถูกต้อง บันทึกรายการเป็น `pending_review` เรียบร้อย (หาก `needs_type_review === true` ให้แสดงแท็กเตือนให้ผู้ใช้กดตรวจสอบว่าเงินเข้าหรือเงินออก)
2. **`duplicate`**: สลิปซ้ำ (มีรหัสอ้างอิงในระบบแล้ว ไม่บันทึกซ้ำ)
3. **`failed`**: รูปไม่ใช่สลิป หรือมองไม่เห็นตัวเลขเงิน แสดงข้อความ `message` ให้ผู้ใช้ทราบ

---

### 4.2 ขอ Signed URL เพื่อเปิดดูรูปสลิป
- **Method / Path**: `GET /slips/:id/image` (Requires Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "signed_url": "https://<supabase-url>/storage/v1/object/sign/slips/...token=...",
    "expires_in": 600
  }
  ```
  นำ `signed_url` ไปใส่ใน `<Image source={{ uri: signed_url }} />` หรือ `<img>` เพื่อแสดงรูปสลิปต้นฉบับได้ทันที (ลิงก์มีอายุ 10 นาที)

---

## 5. ระบบจัดการธุรกรรม (Transactions Endpoints)

### 5.1 รายการธุรกรรมทั้งหมด (Filter & Pagination)
- **Method / Path**: `GET /transactions` (Requires Bearer Token)
- **Query Parameters**:
  - `page`: หน้าที่ต้องการ (default: 1)
  - `limit`: จำนวนต่อหน้า (default: 20, max: 100)
  - `from`: วันที่เริ่มต้น (เช่น `2026-10-01`)
  - `to`: วันที่สิ้นสุด (เช่น `2026-10-31`)
  - `type`: กรองเฉพาะ `income` หรือ `expense`
  - `category_id`: กรองตามหมวดหมู่ UUID
  - `status`: กรองตามสถานะ `pending_review` หรือ `confirmed`
  - `search`: ค้นหาชื่อคู่โอน, เลขบัญชี, บันทึกช่วยจำ, หรือรหัสอ้างอิง
- **Response**:
  ```json
  {
    "data": [ /* Transaction Objects */ ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
  ```

---

### 5.2 สร้างรายการด้วยตนเอง (Manual Entry)
- **Method / Path**: `POST /transactions` (Requires Bearer Token)
- รายการที่สร้างเองจะมีสถานะเป็น `confirmed` ทันที
- **Body**:
  ```json
  {
    "type": "expense",
    "amount": 350.00,
    "fee": 0,
    "transaction_at": "2026-10-14T14:30:00+07:00",
    "counterparty_name": "ร้านตัดผมสมชาย",
    "category_id": "uuid-หมวดหมู่",
    "note": "ตัดผมรับปริญญา"
  }
  ```

---

### 5.3 ยืนยันรายการสลิป (Confirm Single & Bulk)
- **ยืนยันรายการเดียว / แก้ไขข้อมูล**: `PATCH /transactions/:id`
  - เมื่อผู้ใช้กดเข้าไปดูสลิปที่รอตรวจ (`pending_review`) และแก้ไขหมวดหมู่หรือกดยืนยัน ให้ยิง `PATCH` นี้ โดยระบบจะเปลี่ยนสถานะเป็น `confirmed` ให้อัตโนมัติ
- **ยืนยันพร้อมกันหลายรายการ (Confirm All)**: `POST /transactions/confirm-bulk`
  - **Body**:
    ```json
    {
      "ids": [
        "e81d77aa-f179-4509-8472-7634f195d2cb",
        "fa9900bb-1122-3344-5566-778899aabbcc"
      ]
    }
    ```
  - **Response**:
    ```json
    {
      "updated_count": 2,
      "success": true,
      "message": "ยืนยันรายการสำเร็จ 2 รายการ"
    }
    ```

---

### 5.4 ลบรายการธุรกรรม
- **Method / Path**: `DELETE /transactions/:id` (Requires Bearer Token)
- **ฟังก์ชันพิเศษ**: หากรายการนี้มาจากสลิป (`slip_id` ไม่เป็น null) ระบบจะลบประวัติสลิปและ **ลบไฟล์รูปภาพออกจาก Supabase Storage ให้อัตโนมัติแบบ Cascade** เพื่อประหยัดพื้นที่จัดเก็บ

---

## 6. หมวดหมู่ & บัญชีของฉัน (Categories & Own Accounts)

### 6.1 บัญชีของฉัน (Own Accounts)
หน้าสำหรับให้ผู้ใช้เพิ่มบัญชีธนาคารของตนเอง เพื่อให้ AI เปรียบเทียบชื่อและเลขบัญชี 4 หลักสุดท้าย
- `GET /own-accounts`: ดึงรายชื่อบัญชีทั้งหมด
- `POST /own-accounts`:
  ```json
  {
    "bank_name": "KBank",
    "account_name": "สมชาย ใจดี",
    "account_number_last4": "1234"
  }
  ```
- `PATCH /own-accounts/:id`: แก้ไขบัญชี
- `DELETE /own-accounts/:id`: ลบบัญชี

---

### 6.2 หมวดหมู่รายรับ/รายจ่าย (Categories)
- `GET /categories`: ดึงหมวดหมู่ทั้งหมด (หมวดหมู่ระบบ + หมวดหมู่ที่ผู้ใช้สร้างเอง)
  ```json
  [
    {
      "id": "uuid",
      "user_id": null, // null คือ หมวดหมู่เริ่มต้นของระบบ
      "name": "อาหาร",
      "type": "expense",
      "icon": "utensils",
      "color": "#EF4444"
    }
  ]
  ```
- `POST /categories`: สร้างหมวดหมู่ส่วนตัวของผู้ใช้
  ```json
  {
    "name": "สัตว์เลี้ยง",
    "type": "expense",
    "icon": "paw",
    "color": "#F97316"
  }
  ```
- `PATCH /categories/:id` & `DELETE /categories/:id`: ใช้ได้เฉพาะหมวดหมู่ที่ผู้ใช้สร้างเองเท่านั้น (ระบบป้องกันไม่ให้แก้ไขหมวดหมู่เริ่มต้น)

---

## 7. หน้าแดชบอร์ดสรุปผลรายเดือน (Monthly Summary)

- **Method / Path**: `GET /summary?month=YYYY-MM` (Requires Bearer Token)
- หากไม่ระบุ `month` ระบบจะดึงข้อมูลของเดือนปัจจุบันในเวลาประเทศไทยให้อัตโนมัติ
- **หมายเหตุ**: สรุปผลจะนับเฉพาะรายการที่มีสถานะ `confirmed` เท่านั้น

#### ตัวอย่างผลลัพธ์ (Response 200 OK):
```json
{
  "total_income": 45000.00,
  "total_expense": 18250.00,
  "net": 26750.00,
  "total_fee": 15.00,
  "count": 42,
  "by_category": [
    {
      "category_id": "90ba95e5-4d54-411a-8280-5a39bfb822d5",
      "name": "อาหาร",
      "color": "#EF4444",
      "type": "expense",
      "total": 6500.00,
      "percent": 35.62
    },
    {
      "category_id": "81ca95e5-4d54-411a-8280-5a39bfb822e1",
      "name": "เดินทาง",
      "color": "#F59E0B",
      "type": "expense",
      "total": 3200.00,
      "percent": 17.53
    }
  ],
  "daily": [
    { "date": "2026-10-01", "income": 45000.00, "expense": 1200.00 },
    { "date": "2026-10-02", "income": 0.00, "expense": 450.00 },
    { "date": "2026-10-03", "income": 0.00, "expense": 890.00 }
  ],
  "compared_to_last_month": {
    "income_change_pct": 5.25,
    "expense_change_pct": -8.40
  }
}
```

---

## 8. โค้ดตัวอย่างพร้อมใช้ (TypeScript / Axios Client)

คัดลอกไฟล์นี้ไปวางในโปรเจกต์ Frontend ของคุณเพื่อเริ่มเรียกใช้ API ได้ทันที:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ปรับตาม Base URL ของคุณ
const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Helper สำหรับเก็บ Token (เช่น AsyncStorage, Expo SecureStore หรือ localStorage)
export const TokenStorage = {
  getAccessToken: async (): Promise<string | null> => localStorage.getItem('access_token'),
  getRefreshToken: async (): Promise<string | null> => localStorage.getItem('refresh_token'),
  setTokens: async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clear: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// 1. Request Interceptor: แนบ Bearer Token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await TokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Auto Refresh Token เมื่อได้ 401 TOKEN_EXPIRED
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      error.response.data?.error === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = await TokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          await TokenStorage.setTokens(data.access_token, data.refresh_token);

          // Retry request เดิมด้วย token ใหม่
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          // รีเฟรชไม่ผ่าน บังคับ Logout ให้ผู้ใช้ล็อกอินใหม่
          await TokenStorage.clear();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

// 3. ฟังก์ชันอัปโหลดสลิปตัวอย่าง (Multipart File Upload)
export async function uploadSlips(imageFiles: File[]) {
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/slips', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
```
