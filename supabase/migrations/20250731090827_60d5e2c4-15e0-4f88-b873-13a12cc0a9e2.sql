-- Phase 1: Critical Database Security Fixes (Targeted)

-- 1. Create comprehensive RLS policies for crop_cultivation_plans
ALTER TABLE public.crop_cultivation_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cultivation plans" 
ON public.crop_cultivation_plans 
FOR SELECT 
USING (true);

-- 2. Create RLS policies for crop_diseases  
ALTER TABLE public.crop_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crop diseases" 
ON public.crop_diseases 
FOR SELECT 
USING (true);

-- 3. Create RLS policies for crop_growth_tracking
ALTER TABLE public.crop_growth_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crop tracking" 
ON public.crop_growth_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crop tracking" 
ON public.crop_growth_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop tracking" 
ON public.crop_growth_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop tracking" 
ON public.crop_growth_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create RLS policies for crop_recommendations
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crop recommendations" 
ON public.crop_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crop recommendations" 
ON public.crop_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop recommendations" 
ON public.crop_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop recommendations" 
ON public.crop_recommendations 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create RLS policies for fertilizer_recommendations
ALTER TABLE public.fertilizer_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fertilizer recommendations" 
ON public.fertilizer_recommendations 
FOR SELECT 
USING (true);

-- 6. Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Fix database function security - Update the trigger function with proper security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;