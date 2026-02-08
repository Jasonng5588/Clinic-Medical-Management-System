-- ============================================
-- FIX APPOINTMENTS TABLE - Run this!
-- ============================================

-- Drop existing function and trigger first
DROP TRIGGER IF EXISTS auto_generate_appointment_number ON appointments;
DROP FUNCTION IF EXISTS generate_appointment_number();

-- Create function to auto-generate appointment_number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_number IS NULL OR NEW.appointment_number = '' THEN
        NEW.appointment_number := 'APT-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER auto_generate_appointment_number
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION generate_appointment_number();

-- Disable RLS
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

SELECT 'DONE! Appointments table fixed.' as result;
