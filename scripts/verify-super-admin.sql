-- ============================================
-- VERIFY YOUR SUPER ADMIN SETUP
-- Run this to check if everything is properly linked
-- ============================================

-- Check auth.users
SELECT 'AUTH USER:' as check_type, id, email, created_at 
FROM auth.users 
WHERE email = 'ngjyashen@gmail.com';

-- Check staff_profiles
SELECT 'STAFF PROFILE:' as check_type, id, email, role, is_active 
FROM staff_profiles 
WHERE email = 'ngjyashen@gmail.com';

-- Check if IDs match
SELECT 
    CASE 
        WHEN au.id = sp.id THEN '✅ IDs MATCH - Profile is linked correctly!'
        ELSE '❌ IDs DO NOT MATCH - Profile not linked to auth user!'
    END as status,
    au.id as auth_user_id,
    sp.id as staff_profile_id
FROM auth.users au
LEFT JOIN staff_profiles sp ON sp.email = au.email
WHERE au.email = 'ngjyashen@gmail.com';

-- If no profile exists or IDs don't match, run this:
-- DELETE FROM staff_profiles WHERE email = 'ngjyashen@gmail.com';
-- INSERT INTO staff_profiles (id, role, first_name, last_name, email, is_active)
-- SELECT id, 'super_admin', 'Super', 'Admin', email, true
-- FROM auth.users WHERE email = 'ngjyashen@gmail.com';
