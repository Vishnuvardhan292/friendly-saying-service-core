-- Create storage bucket for crop images (disease detection)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', true);

-- Create policies for crop image uploads
CREATE POLICY "Anyone can view crop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-images');

CREATE POLICY "Users can upload crop images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their crop images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their crop images"
ON storage.objects FOR DELETE
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create disease detection results table
CREATE TABLE public.disease_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  detected_disease TEXT,
  confidence_score NUMERIC,
  symptoms TEXT,
  treatment_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for disease detections
ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for disease detections
CREATE POLICY "Users can view their own disease detections"
ON public.disease_detections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disease detections"
ON public.disease_detections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disease detections"
ON public.disease_detections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disease detections"
ON public.disease_detections FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for disease detections updated_at
CREATE TRIGGER update_disease_detections_updated_at
BEFORE UPDATE ON public.disease_detections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();