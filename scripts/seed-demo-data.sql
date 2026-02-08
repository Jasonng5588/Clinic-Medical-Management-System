-- ============================================
-- CLINIC MANAGEMENT SYSTEM - COMPLETE DEMO DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Create services table if not exists
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

-- STEP 2: Insert demo services
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

-- STEP 3: Insert demo patients
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
('P00000005', 'Muhammad', 'Hafiz', 'hafiz.m@email.com', '+60123456005', 'male', '1988-09-30', 'O-', '56 Bangsar South', 'Kuala Lumpur', 'WP', '59200', 'Malaysia', 'Zainab Hafiz', '+60123456105', 'Spouse', 'ACL surgery 2020', 'Ibuprofen', NULL, true),
('P00000006', 'Tan', 'Wei Ming', 'weiming.tan@email.com', '+60123456006', 'male', '1972-05-18', 'A-', '89 Damansara Heights', 'Kuala Lumpur', 'WP', '50490', 'Malaysia', 'Tan Mei Hua', '+60123456106', 'Sibling', 'Heart stent 2019', 'Aspirin', 'Heart disease, Cholesterol', true),
('P00000007', 'Priya', 'Devi', 'priya.devi@email.com', '+60123456007', 'female', '1992-12-05', 'B-', '34 Mont Kiara', 'Kuala Lumpur', 'WP', '50480', 'Malaysia', 'Rajan Nair', '+60123456107', 'Spouse', NULL, 'Latex', NULL, true),
('P00000008', 'Wong', 'Jun Kit', 'junkit.wong@email.com', '+60123456008', 'male', '2000-04-25', 'O+', '67 Cheras', 'Kuala Lumpur', 'WP', '56000', 'Malaysia', 'Wong Ah Kow', '+60123456108', 'Parent', NULL, 'None', NULL, true),
('P00000009', 'Aminah', 'Binti Hassan', 'aminah.hassan@email.com', '+60123456009', 'female', '1965-08-12', 'A+', '12 Taman Melawati', 'Kuala Lumpur', 'WP', '53100', 'Malaysia', 'Hassan bin Ali', '+60123456109', 'Spouse', 'Knee replacement 2021', 'Codeine', 'Osteoarthritis, Hypertension', true),
('P00000010', 'Muthu', 'Samy', 'muthu.samy@email.com', '+60123456010', 'male', '1982-01-28', 'AB-', '90 Subang Jaya', 'Subang Jaya', 'Selangor', '47500', 'Malaysia', 'Lakshmi Muthu', '+60123456110', 'Spouse', NULL, 'Sulfa drugs', 'Gout', true)
ON CONFLICT DO NOTHING;

-- STEP 4: Insert demo medicines
INSERT INTO medicines (
    name, generic_name, category, form, strength,
    current_stock, reorder_level, price_per_unit, is_active
) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'Tablet', '500mg', 500, 100, 1.00, true),
('Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'Capsule', '500mg', 300, 50, 2.50, true),
('Omeprazole 20mg', 'Omeprazole', 'Gastric', 'Capsule', '20mg', 400, 80, 1.80, true),
('Metformin 500mg', 'Metformin', 'Diabetes', 'Tablet', '500mg', 600, 100, 1.20, true),
('Amlodipine 5mg', 'Amlodipine', 'Cardiovascular', 'Tablet', '5mg', 350, 70, 2.00, true),
('Atorvastatin 20mg', 'Atorvastatin', 'Cardiovascular', 'Tablet', '20mg', 250, 50, 3.50, true),
('Salbutamol Inhaler', 'Salbutamol', 'Respiratory', 'Inhaler', '100mcg', 80, 20, 35.00, true),
('Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'Tablet', '10mg', 450, 90, 0.80, true),
('Ibuprofen 400mg', 'Ibuprofen', 'Pain Relief', 'Tablet', '400mg', 400, 80, 1.50, true),
('Losartan 50mg', 'Losartan', 'Cardiovascular', 'Tablet', '50mg', 320, 60, 2.20, true),
('Prednisolone 5mg', 'Prednisolone', 'Corticosteroid', 'Tablet', '5mg', 200, 40, 1.60, true),
('Azithromycin 500mg', 'Azithromycin', 'Antibiotics', 'Tablet', '500mg', 150, 30, 4.50, true),
('Vitamin D3 1000IU', 'Cholecalciferol', 'Vitamins', 'Tablet', '1000IU', 800, 150, 0.60, true),
('Multivitamin', 'Multivitamin Complex', 'Vitamins', 'Tablet', 'Complex', 600, 100, 1.00, true),
('Ranitidine 150mg', 'Ranitidine', 'Gastric', 'Tablet', '150mg', 350, 70, 1.00, true),
('Gabapentin 300mg', 'Gabapentin', 'Neurology', 'Capsule', '300mg', 120, 25, 4.00, true),
('Insulin Pen', 'Insulin Glargine', 'Diabetes', 'Injection', '100U/ml', 40, 10, 95.00, true),
('Clopidogrel 75mg', 'Clopidogrel', 'Cardiovascular', 'Tablet', '75mg', 280, 50, 2.80, true),
('Fluoxetine 20mg', 'Fluoxetine', 'Psychiatry', 'Capsule', '20mg', 180, 35, 2.00, true),
('Diclofenac Gel 1%', 'Diclofenac', 'Topical', 'Gel', '1%', 100, 20, 18.00, true)
ON CONFLICT DO NOTHING;

-- STEP 5: Fix RLS policies for staff_profiles to allow insert during registration
-- This allows users to create their own profile
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own profile" ON staff_profiles;
    CREATE POLICY "Users can insert their own profile" ON staff_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped: %', SQLERRM;
END $$;

-- Make sure RLS is enabled but allows authenticated users to read all staff
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated read" ON staff_profiles;
    CREATE POLICY "Allow authenticated read" ON staff_profiles
        FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped: %', SQLERRM;
END $$;

-- Also allow updates to own profile
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON staff_profiles;
    CREATE POLICY "Users can update own profile" ON staff_profiles
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped: %', SQLERRM;
END $$;

SELECT 'Demo data inserted successfully!' as result;

-- ============================================
-- NOTE: To create demo DOCTORS for the dropdown:
-- 
-- 1. Go to your app at localhost:3001/register
-- 2. Register staff with role "Doctor":
--    - Email: dr.ahmad@clinic.com, Role: Doctor
--    - Email: dr.sarah@clinic.com, Role: Doctor
--    - Email: dr.rajesh@clinic.com, Role: Doctor
--
-- This is required because staff_profiles.id must link 
-- to a real auth.users record (foreign key constraint).
-- ============================================
