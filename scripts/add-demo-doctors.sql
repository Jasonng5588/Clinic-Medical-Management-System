-- ============================================
-- ADD DEMO DOCTORS - RUN THIS!
-- This creates temporary auth users and doctor profiles
-- ============================================

-- Method: Temporarily disable FK constraint on staff_profiles
-- This allows us to insert demo doctors for development
ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_id_fkey;

-- Now insert demo doctors
INSERT INTO staff_profiles (id, role, first_name, last_name, email, phone, specialization, is_active)
VALUES 
('00000000-0000-0000-0000-000000000001', 'doctor', 'Ahmad', 'Rahman', 'dr.ahmad@clinic.com', '+60123000001', 'General Practitioner', true),
('00000000-0000-0000-0000-000000000002', 'doctor', 'Sarah', 'Lim', 'dr.sarah@clinic.com', '+60123000002', 'Pediatrics', true),
('00000000-0000-0000-0000-000000000003', 'doctor', 'Rajesh', 'Nair', 'dr.rajesh@clinic.com', '+60123000003', 'Cardiology', true),
('00000000-0000-0000-0000-000000000004', 'nurse', 'Fatimah', 'Abdullah', 'nurse.fatimah@clinic.com', '+60123000004', NULL, true),
('00000000-0000-0000-0000-000000000005', 'receptionist', 'Maria', 'Santos', 'maria@clinic.com', '+60123000005', NULL, true)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Verify the doctors were added
SELECT role, first_name || ' ' || last_name as name, specialization 
FROM staff_profiles 
WHERE role = 'doctor' AND is_active = true;
