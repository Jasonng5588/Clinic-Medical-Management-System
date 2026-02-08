-- Add missing columns to staff_profiles table
-- Run this in Supabase SQL Editor

-- 1. Add department column
ALTER TABLE staff_profiles 
  ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- 2. Add other potentially missing columns
ALTER TABLE staff_profiles 
  ADD COLUMN IF NOT EXISTS specialization VARCHAR(100),
  ADD COLUMN IF NOT EXISTS qualification VARCHAR(100),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20) DEFAULT 'full-time';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Staff profiles table updated successfully!';
    RAISE NOTICE 'Added columns: department, specialization, qualification, license_number, hire_date, employment_status';
END $$;
