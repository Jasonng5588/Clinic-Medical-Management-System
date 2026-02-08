-- Check the actual schema of queues table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'queues'
ORDER BY ordinal_position;
