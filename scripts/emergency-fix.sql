-- Fix RLS and database issues
-- Run this in Supabase SQL Editor

-- 1. Allow staff_profiles updates for all authenticated users
DROP POLICY IF EXISTS "Users can update own staff profile" ON staff_profiles;
CREATE POLICY "Allow authenticated users to update staff profiles"  
ON staff_profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Fix queues priority_level column type (change from text to integer)
ALTER TABLE queues 
  ALTER COLUMN priority_level TYPE INTEGER USING CASE 
    WHEN priority_level = 'normal' THEN 1
    WHEN priority_level = 'urgent' THEN 2  
    WHEN priority_level = 'emergency' THEN 3
    ELSE 1
  END;

-- 3. Add consultation_number if missing
ALTER TABLE consultations 
  ADD COLUMN IF NOT EXISTS consultation_number VARCHAR(50);

-- Update existing records without consultation numbers
UPDATE consultations 
SET consultation_number = 'CON' || id::text || floor(random() * 1000)::text
WHERE consultation_number IS NULL OR consultation_number = '';

-- Make it required
ALTER TABLE consultations 
  ALTER COLUMN consultation_number SET NOT NULL;

-- Add unique constraint
ALTER TABLE consultations 
  DROP CONSTRAINT IF EXISTS consultations_consultation_number_key;
ALTER TABLE consultations 
  ADD CONSTRAINT consultations_consultation_number_key UNIQUE (consultation_number);

-- 4. Disable RLS temporarily for development (ONLY FOR DEVELOPMENT!)
ALTER TABLE staff_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE queues DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON staff_profiles TO authenticated;
GRANT ALL ON consultations TO authenticated;
GRANT ALL ON queues TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON payments TO authenticated;
GRANT ALL ON prescriptions TO authenticated;
GRANT ALL ON prescription_items TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
