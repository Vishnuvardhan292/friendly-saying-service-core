-- Create crops table for managing different crop types
CREATE TABLE public.crops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  variety text,
  category text NOT NULL, -- vegetables, fruits, grains, etc.
  planting_date date,
  expected_harvest_date date,
  growth_stage text DEFAULT 'planning',
  field_location text,
  area_planted numeric, -- in acres or hectares
  notes text,
  status text DEFAULT 'active', -- active, harvested, failed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own crops" 
ON public.crops 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crops" 
ON public.crops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops" 
ON public.crops 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops" 
ON public.crops 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crops_updated_at
BEFORE UPDATE ON public.crops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();