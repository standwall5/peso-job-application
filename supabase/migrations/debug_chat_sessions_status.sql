-- Debug script to check chat_sessions table and status values

-- 1. Check the status column type
SELECT
    column_name,
    data_type,
    character_maximum_length,
    column_default
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
  AND column_name = 'status';

-- 2. Check all unique status values in the table
SELECT
    status,
    COUNT(*) as count,
    pg_typeof(status) as data_type
FROM chat_sessions
GROUP BY status
ORDER BY count DESC;

-- 3. Show recent chat sessions with their actual status values
SELECT
    id,
    user_id,
    admin_id,
    status,
    LENGTH(status) as status_length,
    concern,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;

-- 4. Test the database function with different status values
SELECT
    'Testing pending status' as test_name,
    COUNT(*) as result_count
FROM get_chat_sessions_for_admin('pending');

SELECT
    'Testing active status' as test_name,
    COUNT(*) as result_count
FROM get_chat_sessions_for_admin('active');

SELECT
    'Testing closed status' as test_name,
    COUNT(*) as result_count
FROM get_chat_sessions_for_admin('closed');

-- 5. Direct comparison to see what WHERE clause returns
SELECT
    'Direct WHERE status = pending' as test_name,
    COUNT(*) as result_count
FROM chat_sessions
WHERE status = 'pending';

SELECT
    'Direct WHERE status = active' as test_name,
    COUNT(*) as result_count
FROM chat_sessions
WHERE status = 'active';

SELECT
    'Direct WHERE status = closed' as test_name,
    COUNT(*) as result_count
FROM chat_sessions
WHERE status = 'closed';

-- 6. Check for any whitespace or hidden characters in status values
SELECT
    id,
    status,
    LENGTH(status) as len,
    ascii(substring(status, 1, 1)) as first_char_ascii,
    ascii(substring(status, LENGTH(status), 1)) as last_char_ascii,
    status = 'pending' as matches_pending,
    status = 'active' as matches_active,
    status = 'closed' as matches_closed
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 7. Show the function definition to verify parameter types
SELECT
    routine_name,
    data_type as return_type,
    parameter_name,
    parameter_mode,
    data_type as parameter_type
FROM information_schema.parameters
WHERE specific_name IN (
    SELECT specific_name
    FROM information_schema.routines
    WHERE routine_name = 'get_chat_sessions_for_admin'
)
ORDER BY ordinal_position;
