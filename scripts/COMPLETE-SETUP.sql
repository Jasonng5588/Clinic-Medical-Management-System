-- ============================================
-- COMPLETE CLINIC SETUP - RUN THIS ONE SCRIPT!
-- ============================================

-- STEP 1: Disable RLS for development
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS queues DISABLE ROW LEVEL SECURITY;

-- STEP 2: Fix staff_profiles RLS - Drop ALL policies first
DROP POLICY IF EXISTS "Anyone can read staff profiles" ON staff_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON staff_profiles;

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read staff profiles" ON staff_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON staff_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON staff_profiles FOR UPDATE USING (auth.uid() = id);

-- STEP 3: Create services table
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

-- STEP 4: Remove FK constraint for demo doctors
ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_id_fkey;

-- STEP 5: Insert demo data

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

-- Demo Doctors
INSERT INTO staff_profiles (id, role, first_name, last_name, email, phone, specialization, is_active)
VALUES 
('00000000-0000-0000-0000-000000000001', 'doctor', 'Ahmad', 'Rahman', 'dr.ahmad@clinic.com', '+60123000001', 'General Practitioner', true),
('00000000-0000-0000-0000-000000000002', 'doctor', 'Sarah', 'Lim', 'dr.sarah@clinic.com', '+60123000002', 'Pediatrics', true),
('00000000-0000-0000-0000-000000000003', 'doctor', 'Rajesh', 'Nair', 'dr.rajesh@clinic.com', '+60123000003', 'Cardiology', true),
('00000000-0000-0000-0000-000000000004', 'nurse', 'Fatimah', 'Abdullah', 'nurse.fatimah@clinic.com', '+60123000004', NULL, true),
('00000000-0000-0000-0000-000000000005', 'receptionist', 'Maria', 'Santos', 'maria@clinic.com', '+60123000005', NULL, true)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role, is_active = true;

-- Demo Patients
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
('P00000006', 'Tan', 'Wei Ming', 'weiming.tan@email.com', '+60123456006', 'male', '1972-05-18', 'A-', '89 Damansara Heights', 'Kuala Lumpur', 'WP', '50490', 'Malaysia', 'Tan Mei Hua', '+60123456106', 'Sibling', 'Heart stent 2019', 'Aspirin', 'Heart disease, Cholesterol', true)
ON CONFLICT DO NOTHING;

-- Demo Medicines
INSERT INTO medicines (name, generic_name, category, form, strength, current_stock, reorder_level, price_per_unit, is_active) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'Tablet', '500mg', 500, 100, 1.00, true),
('Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'Capsule', '500mg', 300, 50, 2.50, true),
('Omeprazole 20mg', 'Omeprazole', 'Gastric', 'Capsule', '20mg', 400, 80, 1.80, true),
('Metformin 500mg', 'Metformin', 'Diabetes', 'Tablet', '500mg', 600, 100, 1.20, true),
('Amlodipine 5mg', 'Amlodipine', 'Cardiovascular', 'Tablet', '5mg', 350, 70, 2.00, true),
('Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'Tablet', '10mg', 450, 90, 0.80, true),
('Ibuprofen 400mg', 'Ibuprofen', 'Pain Relief', 'Tablet', '400mg', 400, 80, 1.50, true),
('Salbutamol Inhaler', 'Salbutamol', 'Respiratory', 'Inhaler', '100mcg', 80, 20, 35.00, true),
('Prednisolone 5mg', 'Prednisolone', 'Corticosteroid', 'Tablet', '5mg', 200, 40, 1.60, true),
('Clopidogrel 75mg', 'Clopidogrel', 'Cardiovascular', 'Tablet', '75mg', 280, 50, 2.80, true),
('Atorvastatin 20mg', 'Atorvastatin', 'Cardiovascular', 'Tablet', '20mg', 250, 50, 3.50, true)
ON CONFLICT DO NOTHING;

-- Demo Medical Records
INSERT INTO consultations (consultation_number, patient_id, doctor_id, diagnosis, symptoms, notes, created_at)
SELECT 'CON-2024-0001', p.id, '00000000-0000-0000-0000-000000000001'::uuid,
    'Viral Upper Respiratory Infection', 'Headache, mild fever, sore throat',
    'Patient complains of persistent headache for 3 days. Advised rest and fluids.',
    NOW() - INTERVAL '2 days'
FROM patients p WHERE p.patient_number = 'P00000001'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (consultation_number, patient_id, doctor_id, diagnosis, symptoms, notes, created_at)
SELECT 'CON-2024-0002', p.id, '00000000-0000-0000-0000-000000000001'::uuid,
    'Type 2 Diabetes Mellitus - Follow Up', 'Morning dizziness, diabetes monitoring',
    'Good medication compliance. Random glucose: 145 mg/dL. Continue current meds.',
    NOW() - INTERVAL '3 days'
FROM patients p WHERE p.patient_number = 'P00000003'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (consultation_number, patient_id, doctor_id, diagnosis, symptoms, notes, created_at)
SELECT 'CON-2024-0003', p.id, '00000000-0000-0000-0000-000000000002'::uuid,
    'Acute Asthma Exacerbation', 'Wheezing, shortness of breath, chest tightness',
    'Patient stabilized after nebulization. SpO2 improved to 98%. Inhaler prescribed.',
    NOW() - INTERVAL '1 day'
FROM patients p WHERE p.patient_number = 'P00000004'
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'SETUP COMPLETE!' as status, 
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM staff_profiles WHERE role = 'doctor') as doctors,
    (SELECT COUNT(*) FROM patients) as patients,
    (SELECT COUNT(*) FROM medicines) as medicines,
    (SELECT COUNT(*) FROM consultations) as medical_records;
