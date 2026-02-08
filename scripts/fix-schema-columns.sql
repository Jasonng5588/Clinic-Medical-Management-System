-- ============================================
-- FIX MISSING COLUMNS IN DATABASE
-- Run this to add missing columns
-- ============================================

-- Add missing columns to queues table
ALTER TABLE queues ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ;
ALTER TABLE queues ADD COLUMN IF NOT EXISTS called_at TIMESTAMPTZ;
ALTER TABLE queues ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add missing columns to consultations table
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS assessment TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS subjective TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS prescriptions JSONB;

-- Disable RLS for development
ALTER TABLE queues DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

SELECT 'Schema fixed! Columns added.' as result;
