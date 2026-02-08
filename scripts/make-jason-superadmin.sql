-- Make jasonngfws2@gmail.com a super_admin
-- User ID: d1fc92e3-20b9-49ab-b4a4-8174fc9325bd

DELETE FROM staff_profiles WHERE email = 'jasonngfws2@gmail.com';

INSERT INTO staff_profiles (id, role, first_name, last_name, email, is_active)
VALUES (
    'd1fc92e3-20b9-49ab-b4a4-8174fc9325bd',
    'super_admin',
    'Jason',
    'Ng',
    'jasonngfws2@gmail.com',
    true
);

SELECT 'Done! jasonngfws2@gmail.com is now super_admin' as result;
