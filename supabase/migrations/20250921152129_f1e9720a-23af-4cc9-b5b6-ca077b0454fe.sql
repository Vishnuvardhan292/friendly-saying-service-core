-- Make user_id column NOT NULL to ensure RLS policies work correctly
-- This prevents any future security issues where profiles could have null user_id values
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add a comment to document the security requirement
COMMENT ON COLUMN public.profiles.user_id IS 'User ID must not be null for RLS policies to work correctly';