-- Fix RLS policy on profiles table to ensure proper data protection
-- Drop existing policy and recreate with enhanced security

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a more secure SELECT policy with explicit authentication check
CREATE POLICY "Users can only view their own profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
);

-- Ensure no public access by creating an explicit deny policy for anonymous users
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add a safety policy to prevent any unauthorized access
CREATE POLICY "Prevent unauthorized profile access" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);