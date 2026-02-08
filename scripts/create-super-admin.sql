-- ============================================
-- FIX SUPER ADMIN FOR ngjyashen@gmail.com
-- Run this to link your auth user to super_admin
-- ============================================

-- First, get the user ID from auth.users
-- Your ID is: 7ce7ebc-421f-4fbf-accc-4cc4f9e80e54

-- Delete any existing profile for this email (to avoid conflicts)
DELETE FROM staff_profiles WHERE email = 'ngjyashen@gmail.com';

-- Insert the super_admin profile with the correct auth user ID
INSERT INTO staff_profiles (
    id,
    role,
    first_name,
    last_name,
    email,
    phone,
    is_active
)
SELECT 
    id,
    'super_admin',
    'Super',
    'Admin',
    email,
    NULL,
    true
FROM auth.users 
WHERE email = 'ngjyashen@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'super_admin',
    is_active = true;

-- Verify it worked
SELECT 'Super Admin created!' as status, id, email, role 
FROM staff_profiles 
WHERE email = 'ngjyashen@gmail.com';
