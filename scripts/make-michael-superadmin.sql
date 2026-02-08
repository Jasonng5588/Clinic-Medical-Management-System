-- Make michaelng5588@gmail.com a super_admin
-- User ID: 8b415a35-937c-44d7-af2c-0e2ffb76bcd9

DELETE FROM staff_profiles WHERE email = 'michaelng5588@gmail.com';

INSERT INTO staff_profiles (id, role, first_name, last_name, email, is_active)
VALUES (
    '8b415a35-937c-44d7-af2c-0e2ffb76bcd9',
    'super_admin',
    'Michael',
    'Ng',
    'michaelng5588@gmail.com',
    true
);

SELECT 'Done! michaelng5588@gmail.com is now super_admin' as result;
