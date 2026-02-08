-- ============================================
-- FIX ALL RLS POLICIES - RUN THIS FIRST!
-- This enables authenticated users to read/write data
-- ============================================

-- STEP 1: Disable RLS on all tables (for development)
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS queues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS refunds DISABLE ROW LEVEL SECURITY;

-- STEP 2: For staff_profiles, we need RLS but with proper policies
-- Drop all existing policies first
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'staff_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON staff_profiles', pol.policyname);
    END LOOP;
END $$;

-- Create new policies for staff_profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read staff profiles (needed for doctor dropdown)
CREATE POLICY "Anyone can read staff profiles" ON staff_profiles
    FOR SELECT USING (true);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON staff_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON staff_profiles
    FOR UPDATE USING (auth.uid() = id);

-- STEP 3: Create services table if not exists
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    duration_minutes integer DEFAULT 30,
    price numeric(10,2) DEFAULT 0,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- STEP 4: Insert demo data
-- Services
INSERT INTO services (name, description, duration_minutes, price, category) VALUES
('General Consultation', 'Standard doctor consultation', 30, 80.00, 'Consultation'),
('Specialist Consultation', 'Consultation with specialist', 45, 150.00, 'Consultation'),
('Health Screening', 'Full body health check', 60, 350.00, 'Screening'),
('Blood Test', 'Complete blood count and panel', 15, 120.00, 'Laboratory'),
('X-Ray', 'Standard X-ray imaging', 20, 180.00, 'Imaging'),
('Ultrasound', 'Ultrasound examination', 30, 200.00, 'Imaging'),
('ECG', 'Electrocardiogram test', 15, 100.00, 'Cardiology'),
('Vaccination', 'Standard immunization', 15, 80.00, 'Preventive'),
('Minor Surgery', 'Minor surgical procedures', 45, 500.00, 'Surgery'),
('Physiotherapy', 'Physical therapy session', 45, 120.00, 'Therapy')
ON CONFLICT DO NOTHING;

-- Patients
INSERT INTO patients (
    patient_number, first_name, last_name, email, phone, gender, date_of_birth,
    blood_group, address, city, state, postal_code, country,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    medical_history, allergies, chronic_conditions, is_active
) VALUES
('P00000001', 'Ahmad', 'Ibrahim', 'ahmad.ibrahim@email.com', '+60123456001', 'male', '1985-03-15', 'O+', '123 Jalan Bukit Bintang', 'Kuala Lumpur', 'WP', '50200', 'Malaysia', 'Fatimah Ibrahim', '+60123456101', 'Spouse', 'Appendectomy 2015', 'Penicillin', 'Hypertension', true),
('P00000002', 'Siti', 'Nurhaliza', 'siti.nur@email.com', '+60123456002', 'female', '1990-07-22', 'A+', '45 Jalan Ampang', 'Kuala Lumpur', 'WP', '50450', 'Malaysia', 'Halim Ahmad', '+60123456102', 'Parent', NULL, 'Shellfish', NULL, true),
('P00000003', 'Raj', 'Kumar', 'raj.kumar@email.com', '+60123456003', 'male', '1978-11-08', 'B+', '78 Jalan Petaling', 'Petaling Jaya', 'Selangor', '46000', 'Malaysia', 'Priya Kumar', '+60123456103', 'Spouse', 'Diabetes diagnosed 2018', 'None', 'Type 2 Diabetes', true),
('P00000004', 'Lee', 'Mei Ling', 'meiling.lee@email.com', '+60123456004', 'female', '1995-02-14', 'AB+', '22 Taman Sri Hartamas', 'Kuala Lumpur', 'WP', '50480', 'Malaysia', 'Lee Chong Wei', '+60123456104', 'Parent', NULL, 'Dust mites', 'Asthma', true),
('P00000005', 'Muhammad', 'Hafiz', 'hafiz.m@email.com', '+60123456005', 'male', '1988-09-30', 'O-', '56 Bangsar South', 'Kuala Lumpur', 'WP', '59200', 'Malaysia', 'Zainab Hafiz', '+60123456105', 'Spouse', 'ACL surgery 2020', 'Ibuprofen', NULL, true)
ON CONFLICT DO NOTHING;

-- Medicines
INSERT INTO medicines (
    name, generic_name, category, form, strength,
    current_stock, reorder_level, price_per_unit, is_active
) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'Tablet', '500mg', 500, 100, 1.00, true),
('Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'Capsule', '500mg', 300, 50, 2.50, true),
('Omeprazole 20mg', 'Omeprazole', 'Gastric', 'Capsule', '20mg', 400, 80, 1.80, true),
('Metformin 500mg', 'Metformin', 'Diabetes', 'Tablet', '500mg', 600, 100, 1.20, true),
('Amlodipine 5mg', 'Amlodipine', 'Cardiovascular', 'Tablet', '5mg', 350, 70, 2.00, true),
('Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'Tablet', '10mg', 450, 90, 0.80, true),
('Ibuprofen 400mg', 'Ibuprofen', 'Pain Relief', 'Tablet', '400mg', 400, 80, 1.50, true)
ON CONFLICT DO NOTHING;

SELECT 'SUCCESS! RLS disabled & demo data inserted. Refresh your app!' as result;
