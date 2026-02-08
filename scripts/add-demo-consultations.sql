-- ============================================
-- ADD DEMO CONSULTATIONS FOR MEDICAL RECORDS
-- Run this AFTER running fix-rls-and-add-data.sql
-- ============================================

-- First, let's get patient IDs for our demo consultations
-- We'll use the demo patients we inserted earlier

-- Demo consultation records (medical history)
INSERT INTO consultations (
    patient_id,
    doctor_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    symptoms,
    notes,
    prescriptions,
    created_at
)
SELECT 
    p.id as patient_id,
    '00000000-0000-0000-0000-000000000001' as doctor_id,
    'Patient complains of persistent headache for 3 days with mild fever. No nausea or vomiting. Pain rated 6/10.' as subjective,
    'Temp: 37.8°C, BP: 120/80 mmHg, HR: 78 bpm. Alert and oriented. No neck stiffness. Throat slightly red.' as objective,
    'Viral upper respiratory infection with tension headache' as assessment,
    'Rest, adequate hydration, symptomatic treatment. Follow-up in 1 week if symptoms persist.' as plan,
    'Viral Upper Respiratory Infection' as diagnosis,
    'Headache, mild fever, sore throat' as symptoms,
    'Patient advised to rest and drink plenty of fluids' as notes,
    '[{"medicine_name": "Paracetamol 500mg", "dosage": "500mg", "frequency": "3 x daily", "duration": "5 days", "instructions": "Take after meals"}]'::jsonb as prescriptions,
    NOW() - INTERVAL '2 days' as created_at
FROM patients p WHERE p.patient_number = 'P00000001'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (
    patient_id,
    doctor_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    symptoms,
    notes,
    prescriptions,
    created_at
)
SELECT 
    p.id as patient_id,
    '00000000-0000-0000-0000-000000000002' as doctor_id,
    'Child brought by mother for routine vaccination. No complaints. Eating and sleeping well.' as subjective,
    'Weight: 15kg (normal for age), Height: 98cm. Active, playful. Heart and lungs clear.' as objective,
    'Healthy child, vaccination due as per schedule' as assessment,
    'Administer DTaP booster. Schedule next vaccination in 6 months.' as plan,
    'Routine Vaccination - DTaP Booster' as diagnosis,
    'None - routine visit' as symptoms,
    'Child tolerated vaccination well. No immediate adverse reaction observed.' as notes,
    '[]'::jsonb as prescriptions,
    NOW() - INTERVAL '1 week' as created_at
FROM patients p WHERE p.patient_number = 'P00000002'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (
    patient_id,
    doctor_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    symptoms,
    notes,
    prescriptions,
    created_at
)
SELECT 
    p.id as patient_id,
    '00000000-0000-0000-0000-000000000001' as doctor_id,
    'Patient presents for diabetes follow-up. Reports good medication compliance. Occasional dizziness in the morning.' as subjective,
    'BP: 135/85 mmHg, Weight: 78kg. Random blood glucose: 145 mg/dL. Feet examination: no ulcers, pulses present.' as objective,
    'Type 2 Diabetes - Moderately controlled. Blood pressure slightly elevated.' as assessment,
    'Continue current diabetes medication. Add lifestyle modifications. Check HbA1c and lipid profile. Follow-up in 1 month.' as plan,
    'Type 2 Diabetes Mellitus - Follow Up' as diagnosis,
    'Morning dizziness, diabetes monitoring' as symptoms,
    'Patient counseled on diet and exercise. Referred to dietitian.' as notes,
    '[{"medicine_name": "Metformin 500mg", "dosage": "500mg", "frequency": "2 x daily", "duration": "30 days", "instructions": "Take with meals"}, {"medicine_name": "Amlodipine 5mg", "dosage": "5mg", "frequency": "1 x daily", "duration": "30 days", "instructions": "Take in the morning"}]'::jsonb as prescriptions,
    NOW() - INTERVAL '3 days' as created_at
FROM patients p WHERE p.patient_number = 'P00000003'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (
    patient_id,
    doctor_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    symptoms,
    notes,
    prescriptions,
    created_at
)
SELECT 
    p.id as patient_id,
    '00000000-0000-0000-0000-000000000002' as doctor_id,
    'Patient experiencing wheezing and shortness of breath since yesterday. Known asthmatic. Has been using inhaler but symptoms not fully controlled.' as subjective,
    'RR: 22/min, SpO2: 96% on room air. Bilateral wheezes on auscultation. No fever. Using accessory muscles minimally.' as objective,
    'Acute asthma exacerbation - Mild to moderate' as assessment,
    'Nebulization x2, increase inhaler frequency. Oral steroids for 5 days. Avoid triggers. Return immediately if symptoms worsen.' as plan,
    'Acute Asthma Exacerbation' as diagnosis,
    'Wheezing, shortness of breath, chest tightness' as symptoms,
    'Patient stabilized after nebulization. SpO2 improved to 98%.' as notes,
    '[{"medicine_name": "Salbutamol Inhaler", "dosage": "2 puffs", "frequency": "Every 4 hours", "duration": "7 days", "instructions": "Use with spacer if available"}, {"medicine_name": "Prednisolone 5mg", "dosage": "30mg", "frequency": "1 x daily", "duration": "5 days", "instructions": "Take in the morning after breakfast"}]'::jsonb as prescriptions,
    NOW() - INTERVAL '1 day' as created_at
FROM patients p WHERE p.patient_number = 'P00000004'
ON CONFLICT DO NOTHING;

INSERT INTO consultations (
    patient_id,
    doctor_id,
    subjective,
    objective,
    assessment,
    plan,
    diagnosis,
    symptoms,
    notes,
    prescriptions,
    created_at
)
SELECT 
    p.id as patient_id,
    '00000000-0000-0000-0000-000000000003' as doctor_id,
    'Patient here for cardiac follow-up. Reports occasional palpitations, especially with stress. No chest pain. Compliant with medications.' as subjective,
    'BP: 128/82 mmHg, HR: 72 bpm regular. No murmurs. JVP normal. No peripheral edema. ECG: Normal sinus rhythm.' as objective,
    'Stable coronary artery disease. Anxiety-related palpitations likely.' as assessment,
    'Continue current cardiac medications. Consider stress management techniques. Repeat ECG in 3 months. Echo if symptoms worsen.' as plan,
    'CAD - Stable, Anxiety-related Palpitations' as diagnosis,
    'Palpitations with stress' as symptoms,
    'Discussed stress reduction techniques. Patient reassured.' as notes,
    '[{"medicine_name": "Clopidogrel 75mg", "dosage": "75mg", "frequency": "1 x daily", "duration": "Ongoing", "instructions": "Take in the evening"}, {"medicine_name": "Atorvastatin 20mg", "dosage": "20mg", "frequency": "1 x daily", "duration": "Ongoing", "instructions": "Take at night"}]'::jsonb as prescriptions,
    NOW() - INTERVAL '5 days' as created_at
FROM patients p WHERE p.patient_number = 'P00000006'
ON CONFLICT DO NOTHING;

SELECT 'Demo consultations added successfully! Check Medical Records page.' as result;
