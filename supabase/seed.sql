-- =====================================================
-- SEED DATA FOR DEVELOPMENT
-- =====================================================

-- Insert roles
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'Super Admin', 'Full system access and management'),
('doctor', 'Doctor', 'Medical practitioner with patient consultation rights'),
('nurse', 'Nurse', 'Nursing staff with patient care responsibilities'),
('receptionist', 'Receptionist', 'Front desk operations and appointment management'),
('accountant', 'Accountant', 'Financial management and billing');

-- Insert services
INSERT INTO services (name, code, description, category, price, duration_minutes) VALUES
('General Consultation', 'GC001', 'General medical consultation', 'Consultation', 50.00, 30),
('Dental Checkup', 'DC001', 'Routine dental examination', 'Dental', 75.00, 45),
('Dental Cleaning', 'DC002', 'Professional teeth cleaning', 'Dental', 100.00, 60),
('Tooth Extraction', 'DE001', 'Simple tooth extraction', 'Dental', 150.00, 45),
('Dental Filling', 'DF001', 'Composite filling', 'Dental', 120.00, 60),
('Root Canal', 'RC001', 'Root canal treatment', 'Dental', 500.00, 90),
('Facial Treatment', 'FT001', 'Basic facial treatment', 'Aesthetic', 80.00, 60),
('Botox Injection', 'BI001', 'Botox cosmetic treatment', 'Aesthetic', 300.00, 30),
('Laser Treatment', 'LT001', 'Laser skin treatment', 'Aesthetic', 250.00, 45),
('Physiotherapy Session', 'PS001', 'Physical therapy session', 'Physiotherapy', 60.00, 60),
('Sports Massage', 'SM001', 'Therapeutic sports massage', 'Physiotherapy', 80.00, 90),
('X-Ray', 'XR001', 'Digital X-ray imaging', 'Radiology', 40.00, 15),
('Blood Test', 'BT001', 'Complete blood count', 'Laboratory', 35.00, 10),
('ECG', 'ECG001', 'Electrocardiogram', 'Diagnostic', 50.00, 20),
('Ultrasound', 'US001', 'Ultrasound imaging', 'Radiology', 120.00, 30);

-- Insert rooms
INSERT INTO rooms (name, room_number, type, capacity) VALUES
('Consultation Room 1', 'R101', 'Consultation', 1),
('Consultation Room 2', 'R102', 'Consultation', 1),
('Consultation Room 3', 'R103', 'Consultation', 1),
('Dental Chair 1', 'D101', 'Dental', 1),
('Dental Chair 2', 'D102', 'Dental', 1),
('Treatment Room 1', 'T101', 'Treatment', 2),
('Physiotherapy Room', 'P101', 'Physiotherapy', 3),
('Aesthetic Room', 'A101', 'Aesthetic', 1),
('X-Ray Room', 'X101', 'Radiology', 1),
('Laboratory', 'L101', 'Laboratory', 2);

-- Insert medicines
INSERT INTO medicines (name, generic_name, brand_name, category, form, strength, unit, manufacturer, price_per_unit, current_stock, reorder_level) VALUES
-- Antibiotics
('Amoxicillin', 'Amoxicillin', 'Amoxil', 'Antibiotic', 'Capsule', '500mg', 'capsule', 'GSK', 0.50, 500, 100),
('Azithromycin', 'Azithromycin', 'Zithromax', 'Antibiotic', 'Tablet', '250mg', 'tablet', 'Pfizer', 1.20, 300, 50),
('Ciprofloxacin', 'Ciprofloxacin', 'Cipro', 'Antibiotic', 'Tablet', '500mg', 'tablet', 'Bayer', 0.80, 400, 80),
('Doxycycline', 'Doxycycline', 'Vibramycin', 'Antibiotic', 'Capsule', '100mg', 'capsule', 'Pfizer', 0.60, 350, 70),

-- Pain Relief
('Paracetamol', 'Paracetamol', 'Panadol', 'Analgesic', 'Tablet', '500mg', 'tablet', 'GSK', 0.10, 1000, 200),
('Ibuprofen', 'Ibuprofen', 'Brufen', 'NSAID', 'Tablet', '400mg', 'tablet', 'Abbott', 0.15, 800, 150),
('Aspirin', 'Acetylsalicylic Acid', 'Aspirin', 'NSAID', 'Tablet', '100mg', 'tablet', 'Bayer', 0.12, 600, 100),
('Tramadol', 'Tramadol', 'Ultram', 'Opioid', 'Tablet', '50mg', 'tablet', 'Janssen', 0.80, 200, 40),

-- Vitamins & Supplements
('Vitamin C', 'Ascorbic Acid', 'Redoxon', 'Vitamin', 'Tablet', '1000mg', 'tablet', 'Bayer', 0.30, 500, 100),
('Vitamin D', 'Cholecalciferol', 'Calciferol', 'Vitamin', 'Capsule', '1000IU', 'capsule', 'Nature Made', 0.40, 400, 80),
('Multivitamin', 'Mixed Vitamins', 'Centrum', 'Supplement', 'Tablet', '-', 'tablet', 'Pfizer', 0.50, 350, 70),
('Calcium', 'Calcium Carbonate', 'Caltrate', 'Supplement', 'Tablet', '600mg', 'tablet', 'Pfizer', 0.35, 300, 60),

-- Gastrointestinal
('Omeprazole', 'Omeprazole', 'Prilosec', 'PPI', 'Capsule', '20mg', 'capsule', 'AstraZeneca', 0.70, 400, 80),
('Ranitidine', 'Ranitidine', 'Zantac', 'H2 Blocker', 'Tablet', '150mg', 'tablet', 'GSK', 0.45, 350, 70),
('Metoclopramide', 'Metoclopramide', 'Reglan', 'Antiemetic', 'Tablet', '10mg', 'tablet', 'Pfizer', 0.30, 250, 50),

-- Antihistamines
('Cetirizine', 'Cetirizine', 'Zyrtec', 'Antihistamine', 'Tablet', '10mg', 'tablet', 'UCB', 0.25, 600, 120),
('Loratadine', 'Loratadine', 'Claritin', 'Antihistamine', 'Tablet', '10mg', 'tablet', 'Bayer', 0.30, 500, 100),
('Chlorpheniramine', 'Chlorpheniramine', 'Piriton', 'Antihistamine', 'Tablet', '4mg', 'tablet', 'GSK', 0.15, 450, 90),

-- Cardiovascular
('Amlodipine', 'Amlodipine', 'Norvasc', 'Calcium Channel Blocker', 'Tablet', '5mg', 'tablet', 'Pfizer', 0.40, 400, 80),
('Atenolol', 'Atenolol', 'Tenormin', 'Beta Blocker', 'Tablet', '50mg', 'tablet', 'AstraZeneca', 0.35, 350, 70),
('Simvastatin', 'Simvastatin', 'Zocor', 'Statin', 'Tablet', '20mg', 'tablet', 'Merck', 0.50, 300, 60),

-- Diabetes
('Metformin', 'Metformin', 'Glucophage', 'Antidiabetic', 'Tablet', '500mg', 'tablet', 'Merck', 0.20, 500, 100),
('Glibenclamide', 'Glibenclamide', 'Daonil', 'Antidiabetic', 'Tablet', '5mg', 'tablet', 'Sanofi', 0.25, 400, 80),

-- Respiratory
('Salbutamol', 'Salbutamol', 'Ventolin', 'Bronchodilator', 'Inhaler', '100mcg', 'puff', 'GSK', 5.00, 100, 20),
('Prednisolone', 'Prednisolone', 'Predsol', 'Corticosteroid', 'Tablet', '5mg', 'tablet', 'Pfizer', 0.30, 300, 60),

-- Topical
('Hydrocortisone Cream', 'Hydrocortisone', 'Cortaid', 'Corticosteroid', 'Cream', '1%', 'tube', 'Johnson & Johnson', 3.50, 150, 30),
('Betadine Solution', 'Povidone-Iodine', 'Betadine', 'Antiseptic', 'Solution', '10%', 'bottle', '3M', 4.00, 200, 40),
('Mupirocin Ointment', 'Mupirocin', 'Bactroban', 'Antibiotic', 'Ointment', '2%', 'tube', 'GSK', 8.00, 100, 20),

-- Others
('Insulin', 'Regular Insulin', 'Humulin', 'Hormone', 'Injection', '100IU/ml', 'vial', 'Eli Lilly', 25.00, 50, 10),
('Epinephrine', 'Epinephrine', 'EpiPen', 'Emergency', 'Injection', '0.3mg', 'auto-injector', 'Mylan', 100.00, 20, 5),
('Naloxone', 'Naloxone', 'Narcan', 'Antidote', 'Injection', '0.4mg/ml', 'vial', 'Adapt', 50.00, 15, 3);

-- Note: Staff profiles will be created via Supabase Auth signup
-- Sample patients (30 patients for testing)
INSERT INTO patients (patient_number, first_name, last_name, email, phone, gender, date_of_birth, blood_group, address, city, state, postal_code, medical_history, allergies) VALUES
('P2026013100001', 'Ahmad', 'Abdullah', 'ahmad.abdullah@email.com', '+60123456789', 'male', '1985-03-15', 'A+', '123 Jalan Ampang', 'Kuala Lumpur', 'Wilayah Persekutuan', '50450', 'Hypertension', 'Penicillin'),
('P2026013100002', 'Siti', 'Nurhaliza', 'siti.nur@email.com', '+60123456790', 'female', '1990-05-22', 'B+', '456 Jalan Tun Razak', 'Kuala Lumpur', 'Wilayah Persekutuan', '50400', 'None', 'None'),
('P2026013100003', 'Lee', 'Wei Ming', 'lee.weiming@email.com', '+60123456791', 'male', '1978-11-08', 'O+', '789 Jalan Imbi', 'Kuala Lumpur', 'Wilayah Persekutuan', '55100', 'Diabetes Type 2', 'Sulfa drugs'),
('P2026013100004', 'Priya', 'Kumar', 'priya.kumar@email.com', '+60123456792', 'female', '1995-07-30', 'AB+', '321 Jalan Bukit Bintang', 'Kuala Lumpur', 'Wilayah Persekutuan', '55100', 'Asthma', 'None'),
('P2026013100005', 'Hassan', 'Ibrahim', 'hassan.ibrahim@email.com', '+60123456793', 'male', '1982-01-12', 'A-', '654 Jalan Damansara', 'Petaling Jaya', 'Selangor', '47400', 'None', 'None'),
('P2026013100006', 'Nur', 'Aisyah', 'nur.aisyah@email.com', '+60123456794', 'female', '1988-09-25', 'B-', '987 Jalan SS2', 'Petaling Jaya', 'Selangor', '47300', 'Migraine', 'Aspirin'),
('P2026013100007', 'Chen', 'Jia Wei', 'chen.jiawei@email.com', '+60123456795', 'male', '1992-04-18', 'O-', '147 Jalan PJS11', 'Subang Jaya', 'Selangor', '47500', 'None', 'None'),
('P2026013100008', 'Fatimah', 'Zahra', 'fatimah.zahra@email.com', '+60123456796', 'female', '1975-12-03', 'AB-', '258 Jalan USJ1', 'Subang Jaya', 'Selangor', '47600', 'Heart Disease', 'Iodine'),
('P2026013100009', 'Raj', 'Kumar', 'raj.kumar@email.com', '+60123456797', 'male', '1987-06-14', 'A+', '369 Jalan Gasing', 'Petaling Jaya', 'Selangor', '46000', 'None', 'None'),
('P2026013100010', 'Zainab', 'Mohamed', 'zainab.mohamed@email.com', '+60123456798', 'female', '1993-02-28', 'B+', '741 Jalan Kelana Jaya', 'Petaling Jaya', 'Selangor', '47301', 'Allergic Rhinitis', 'None'),
('P2026013100011', 'Tan', 'Siew Lan', 'tan.siewlan@email.com', '+60123456799', 'female', '1980-08-07', 'O+', '852 Jalan Shah Alam', 'Shah Alam', 'Selangor', '40000', 'Hypothyroidism', 'None'),
('P2026013100012', 'Mohammad', 'Rizal', 'mohammad.rizal@email.com', '+60123456800', 'male', '1991-10-19', 'AB+', '963 Jalan Setia Alam', 'Shah Alam', 'Selangor', '40170', 'None', 'None'),
('P2026013100013', 'Lim', 'Mei Ling', 'lim.meiling@email.com', '+60123456801', 'female', '1986-03-21', 'A-', '159 Jalan Klang', 'Klang', 'Selangor', '41000', 'Eczema', 'Latex'),
('P2026013100014', 'Arif', 'Rahman', 'arif.rahman@email.com', '+60123456802', 'male', '1994-11-11', 'B-', '357 Jalan Kapar', 'Klang', 'Selangor', '42100', 'None', 'None'),
('P2026013100015', 'Kavitha', 'Suresh', 'kavitha.suresh@email.com', '+60123456803', 'female', '1989-05-05', 'O-', '486 Jalan Teluk Pulai', 'Klang', 'Selangor', '41100', 'GERD', 'None'),
('P2026013100016', 'Khairul', 'Azmi', 'khairul.azmi@email.com', '+60123456804', 'male', '1983-07-27', 'AB-', '753 Jalan Cyberjaya', 'Cyberjaya', 'Selangor', '63000', 'None', 'None'),
('P2026013100017', 'Wong', 'Li Ying', 'wong.liying@email.com', '+60123456805', 'female', '1996-01-09', 'A+', '821 Jalan Putrajaya', 'Putrajaya', 'Wilayah Persekutuan', '62000', 'None', 'None'),
('P2026013100018', 'Abdul', 'Hakim', 'abdul.hakim@email.com', '+60123456806', 'male', '1979-12-31', 'B+', '934 Jalan Cheras', 'Cheras', 'Kuala Lumpur', '56100', 'Chronic Back Pain', 'None'),
('P2026013100019', 'Anita', 'Devi', 'anita.devi@email.com', '+60123456807', 'female', '1992-08-16', 'O+', '167 Jalan Kepong', 'Kepong', 'Kuala Lumpur', '52100', 'None', 'None'),
('P2026013100020', 'Farid', 'Ismail', 'farid.ismail@email.com', '+60123456808', 'male', '1984-04-24', 'AB+', '298 Jalan Sentul', 'Sentul', 'Kuala Lumpur', '51100', 'None', 'Peanuts'),
('P2026013100021', 'Mei', 'Chen', 'mei.chen@email.com', '+60123456809', 'female', '1997-06-12', 'A-', '415 Jalan Setiawangsa', 'Setiawangsa', 'Kuala Lumpur', '54200', 'None', 'None'),
('P2026013100022', 'Nazri', 'Abdullah', 'nazri.abdullah@email.com', '+60123456810', 'male', '1981-09-03', 'B-', '529 Jalan Wangsa Maju', 'Wangsa Maju', 'Kuala Lumpur', '53300', 'Hypertension', 'None'),
('P2026013100023', 'Lakshmi', 'Ramanathan', 'lakshmi.rama@email.com', '+60123456811', 'female', '1990-02-14', 'O-', '648 Jalan Bangsar', 'Bangsar', 'Kuala Lumpur', '59100', 'None', 'None'),
('P2026013100024', 'Rahman', 'Hassan', 'rahman.hassan@email.com', '+60123456812', 'male', '1976-11-20', 'AB-', '772 Jalan Pantai', 'Kuala Lumpur', 'Wilayah Persekutuan', '59200', 'Arthritis', 'None'),
('P2026013100025', 'Yong', 'Hui Min', 'yong.huimin@email.com', '+60123456813', 'female', '1998-03-08', 'A+', '883 Jalan Mont Kiara', 'Mont Kiara', 'Kuala Lumpur', '50480', 'None', 'None'),
('P2026013100026', 'Ismail', 'Yusof', 'ismail.yusof@email.com', '+60123456814', 'male', '1985-07-22', 'B+', '994 Jalan Hartamas', 'Hartamas', 'Kuala Lumpur', '50480', 'None', 'None'),
('P2026013100027', 'Nirmala', 'Siva', 'nirmala.siva@email.com', '+60123456815', 'female', '1991-12-15', 'O+', '105 Jalan Desa', 'Taman Desa', 'Kuala Lumpur', '58100', 'None', 'Shellfish'),
('P2026013100028', 'Azman', 'Osman', 'azman.osman@email.com', '+60123456816', 'male', '1988-05-29', 'AB+', '216 Jalan OUG', 'OUG', 'Kuala Lumpur', '58200', 'None', 'None'),
('P2026013100029', 'Jessica', 'Lau', 'jessica.lau@email.com', '+60123456817', 'female', '1995-09-17', 'A-', '327 Jalan Sri Petaling', 'Sri Petaling', 'Kuala Lumpur', '57000', 'PCOS', 'None'),
('P2026013100030', 'Hafiz', 'Wahab', 'hafiz.wahab@email.com', '+60123456818', 'male', '1982-01-26', 'B-', '438 Jalan Bukit Jalil', 'Bukit Jalil', 'Kuala Lumpur', '57000', 'None', 'None');

-- Insert clinic settings
INSERT INTO settings (key, value, description) VALUES
('clinic_name', '"HealthCare Plus Clinic"', 'Official clinic name'),
('clinic_email', '"contact@healthcareplus.com"', 'Clinic contact email'),
('clinic_phone', '"+60123456789"', 'Clinic phone number'),
('clinic_address', '"123 Medical Plaza, Kuala Lumpur, 50450, Malaysia"', 'Clinic address'),
('tax_percentage', '6', 'Default tax percentage for invoicing'),
('currency', '"MYR"', 'Currency code'),
('working_hours', '{"monday":"9:00-18:00","tuesday":"9:00-18:00","wednesday":"9:00-18:00","thursday":"9:00-18:00","friday":"9:00-18:00","saturday":"9:00-13:00","sunday":"closed"}', 'Clinic operating hours'),
('appointment_duration', '30', 'Default appointment duration in minutes');
