-- =====================================================
-- SYNC AUTH USERS TO DATABASE
-- Run this in Supabase SQL Editor to sync orphaned users
-- =====================================================

-- First, let's see which auth users don't have database profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as db_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY db_status DESC, au.created_at DESC;

-- =====================================================
-- SYNC ORPHANED USERS (Run this to fix the issue)
-- =====================================================

INSERT INTO public.users (id, email, name, hobbies, learning_style, goal)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'hobbies', ''),
    COALESCE(au.raw_user_meta_data->>'learning_style', 'visual'),
    COALESCE(au.raw_user_meta_data->>'goal', '')
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- OPTIONAL: Delete orphaned auth users instead
-- (Use with caution - this deletes auth accounts!)
-- =====================================================
-- DELETE FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM public.users);

-- =====================================================
-- Verify the sync worked
-- =====================================================
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_user_count,
    (SELECT COUNT(*) FROM public.users) as db_user_count;
