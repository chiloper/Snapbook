-- Supabase Migration: 001_init.sql
-- Snapbook: Income and Expense Tracker from Thai Bank Slips
-- Target Schema: slipsum

-- 1. Create Schema and Extensions
CREATE SCHEMA IF NOT EXISTS slipsum;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set search_path so references resolve seamlessly
SET search_path TO slipsum, public;

-- Grant permissions for Supabase roles to access the custom schema
GRANT USAGE ON SCHEMA slipsum TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA slipsum TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA slipsum TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA slipsum TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA slipsum GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA slipsum GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA slipsum GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 2. Create own_accounts table
CREATE TABLE IF NOT EXISTS slipsum.own_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number_last4 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_own_accounts_user_id ON slipsum.own_accounts(user_id);

-- 3. Create categories table
CREATE TABLE IF NOT EXISTS slipsum.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = system default
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#64748B',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON slipsum.categories(user_id);

-- Seed Thai default categories (system defaults with user_id = NULL)
INSERT INTO slipsum.categories (name, type, icon, color, user_id)
VALUES
    -- Expense Categories
    ('อาหาร', 'expense', 'utensils', '#EF4444', NULL),
    ('เดินทาง', 'expense', 'car', '#F59E0B', NULL),
    ('ช้อปปิ้ง', 'expense', 'shopping-bag', '#EC4899', NULL),
    ('บิล/ค่าน้ำไฟ', 'expense', 'receipt', '#8B5CF6', NULL),
    ('ที่พัก', 'expense', 'home', '#3B82F6', NULL),
    ('สุขภาพ', 'expense', 'heart-pulse', '#10B981', NULL),
    ('บันเทิง', 'expense', 'gamepad-2', '#6366F1', NULL),
    ('อื่นๆ', 'expense', 'more-horizontal', '#6B7280', NULL),
    -- Income Categories
    ('เงินเดือน', 'income', 'wallet', '#059669', NULL),
    ('รายได้เสริม', 'income', 'trending-up', '#10B981', NULL),
    ('เงินโอนเข้า', 'income', 'arrow-down-left', '#06B6D4', NULL),
    ('อื่นๆ', 'income', 'more-horizontal', '#6B7280', NULL)
ON CONFLICT DO NOTHING;

-- 4. Create slips table
CREATE TABLE IF NOT EXISTS slipsum.slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    raw_extraction JSONB,
    status TEXT NOT NULL CHECK (status IN ('processing', 'extracted', 'failed')) DEFAULT 'processing',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_slips_user_id ON slipsum.slips(user_id);

-- 5. Create transactions table
CREATE TABLE IF NOT EXISTS slipsum.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slip_id UUID REFERENCES slipsum.slips(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
    transaction_at TIMESTAMPTZ NOT NULL,
    bank_name TEXT,
    counterparty_name TEXT,
    counterparty_account TEXT,
    transaction_ref TEXT,
    category_id UUID REFERENCES slipsum.categories(id) ON DELETE SET NULL,
    note TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending_review', 'confirmed')) DEFAULT 'pending_review',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Unique constraint for preventing duplicate slips per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_ref 
    ON slipsum.transactions (user_id, transaction_ref) 
    WHERE transaction_ref IS NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_trans_at 
    ON slipsum.transactions (user_id, transaction_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
    ON slipsum.transactions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id 
    ON slipsum.transactions (category_id);

-- 6. Row Level Security (RLS) defense-in-depth
ALTER TABLE slipsum.own_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE slipsum.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE slipsum.slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE slipsum.transactions ENABLE ROW LEVEL SECURITY;

-- own_accounts policies
DROP POLICY IF EXISTS own_accounts_select_policy ON slipsum.own_accounts;
CREATE POLICY own_accounts_select_policy ON slipsum.own_accounts
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS own_accounts_insert_policy ON slipsum.own_accounts;
CREATE POLICY own_accounts_insert_policy ON slipsum.own_accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS own_accounts_update_policy ON slipsum.own_accounts;
CREATE POLICY own_accounts_update_policy ON slipsum.own_accounts
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS own_accounts_delete_policy ON slipsum.own_accounts;
CREATE POLICY own_accounts_delete_policy ON slipsum.own_accounts
    FOR DELETE USING (user_id = auth.uid());

-- categories policies (users can see system defaults where user_id IS NULL or their own)
DROP POLICY IF EXISTS categories_select_policy ON slipsum.categories;
CREATE POLICY categories_select_policy ON slipsum.categories
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS categories_insert_policy ON slipsum.categories;
CREATE POLICY categories_insert_policy ON slipsum.categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS categories_update_policy ON slipsum.categories;
CREATE POLICY categories_update_policy ON slipsum.categories
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS categories_delete_policy ON slipsum.categories;
CREATE POLICY categories_delete_policy ON slipsum.categories
    FOR DELETE USING (user_id = auth.uid());

-- slips policies
DROP POLICY IF EXISTS slips_select_policy ON slipsum.slips;
CREATE POLICY slips_select_policy ON slipsum.slips
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS slips_insert_policy ON slipsum.slips;
CREATE POLICY slips_insert_policy ON slipsum.slips
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS slips_update_policy ON slipsum.slips;
CREATE POLICY slips_update_policy ON slipsum.slips
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS slips_delete_policy ON slipsum.slips;
CREATE POLICY slips_delete_policy ON slipsum.slips
    FOR DELETE USING (user_id = auth.uid());

-- transactions policies
DROP POLICY IF EXISTS transactions_select_policy ON slipsum.transactions;
CREATE POLICY transactions_select_policy ON slipsum.transactions
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS transactions_insert_policy ON slipsum.transactions;
CREATE POLICY transactions_insert_policy ON slipsum.transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS transactions_update_policy ON slipsum.transactions;
CREATE POLICY transactions_update_policy ON slipsum.transactions
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS transactions_delete_policy ON slipsum.transactions;
CREATE POLICY transactions_delete_policy ON slipsum.transactions
    FOR DELETE USING (user_id = auth.uid());

-- 7. Monthly Summary Calculation Function (Calculated in SQL in slipsum schema)
CREATE OR REPLACE FUNCTION slipsum.get_monthly_summary(p_user_id UUID, p_month TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_prior_start_date DATE;
    v_prior_end_date DATE;

    v_total_income NUMERIC(14, 2) := 0;
    v_total_expense NUMERIC(14, 2) := 0;
    v_net NUMERIC(14, 2) := 0;
    v_total_fee NUMERIC(14, 2) := 0;
    v_count INT := 0;

    v_prior_income NUMERIC(14, 2) := 0;
    v_prior_expense NUMERIC(14, 2) := 0;
    v_income_change_pct NUMERIC(6, 2) := NULL;
    v_expense_change_pct NUMERIC(6, 2) := NULL;

    v_by_category JSONB := '[]'::jsonb;
    v_daily JSONB := '[]'::jsonb;
BEGIN
    -- Parse month in YYYY-MM format
    BEGIN
        v_start_date := (p_month || '-01')::DATE;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid month format: %. Expected YYYY-MM', p_month;
    END;

    v_end_date := (v_start_date + INTERVAL '1 month')::DATE;
    v_prior_start_date := (v_start_date - INTERVAL '1 month')::DATE;
    v_prior_end_date := v_start_date;

    -- Current month totals (Only confirmed transactions count)
    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(fee), 0),
        COUNT(*)
    INTO
        v_total_income,
        v_total_expense,
        v_total_fee,
        v_count
    FROM slipsum.transactions
    WHERE user_id = p_user_id
      AND status = 'confirmed'
      AND (transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE >= v_start_date
      AND (transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE < v_end_date;

    v_net := v_total_income - v_total_expense;

    -- Prior month totals for comparison
    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO
        v_prior_income,
        v_prior_expense
    FROM slipsum.transactions
    WHERE user_id = p_user_id
      AND status = 'confirmed'
      AND (transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE >= v_prior_start_date
      AND (transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE < v_prior_end_date;

    -- Calculate change percentages
    IF v_prior_income > 0 THEN
        v_income_change_pct := ROUND(((v_total_income - v_prior_income) / v_prior_income * 100), 2);
    ELSE
        v_income_change_pct := NULL;
    END IF;

    IF v_prior_expense > 0 THEN
        v_expense_change_pct := ROUND(((v_total_expense - v_prior_expense) / v_prior_expense * 100), 2);
    ELSE
        v_expense_change_pct := NULL;
    END IF;

    -- By Category breakdown
    SELECT COALESCE(jsonb_agg(cat_row), '[]'::jsonb)
    INTO v_by_category
    FROM (
        SELECT
            t.category_id,
            COALESCE(c.name, 'ไม่ระบุหมวดหมู่') AS name,
            COALESCE(c.color, '#94A3B8') AS color,
            t.type,
            SUM(t.amount)::NUMERIC(14, 2) AS total,
            ROUND((
                SUM(t.amount) / NULLIF(
                    CASE WHEN t.type = 'income' THEN v_total_income ELSE v_total_expense END, 
                    0
                ) * 100
            ), 2) AS percent
        FROM slipsum.transactions t
        LEFT JOIN slipsum.categories c ON t.category_id = c.id
        WHERE t.user_id = p_user_id
          AND t.status = 'confirmed'
          AND (t.transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE >= v_start_date
          AND (t.transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE < v_end_date
        GROUP BY t.category_id, c.name, c.color, t.type
        ORDER BY total DESC
    ) cat_row;

    -- Daily breakdown
    SELECT COALESCE(jsonb_agg(d_row), '[]'::jsonb)
    INTO v_daily
    FROM (
        SELECT
            TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
            COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::NUMERIC(14, 2) AS income,
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::NUMERIC(14, 2) AS expense
        FROM generate_series(v_start_date, (v_end_date - INTERVAL '1 day')::DATE, INTERVAL '1 day') AS d(day)
        LEFT JOIN slipsum.transactions t ON t.user_id = p_user_id
            AND t.status = 'confirmed'
            AND (t.transaction_at AT TIME ZONE 'Asia/Bangkok')::DATE = d.day::DATE
        GROUP BY d.day
        ORDER BY d.day ASC
    ) d_row;

    -- Return full structured JSON
    RETURN jsonb_build_object(
        'total_income', v_total_income,
        'total_expense', v_total_expense,
        'net', v_net,
        'total_fee', v_total_fee,
        'count', v_count,
        'by_category', v_by_category,
        'daily', v_daily,
        'compared_to_last_month', jsonb_build_object(
            'income_change_pct', v_income_change_pct,
            'expense_change_pct', v_expense_change_pct
        )
    );
END;
$$;

-- 8. Storage bucket 'slips' creation and RLS policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'slips',
    'slips',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'slips' bucket (Users can view their own slip uploads)
DROP POLICY IF EXISTS "Users can read own slip objects" ON storage.objects;
CREATE POLICY "Users can read own slip objects" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'slips' AND (storage.foldername(name))[1] = auth.uid()::text);

