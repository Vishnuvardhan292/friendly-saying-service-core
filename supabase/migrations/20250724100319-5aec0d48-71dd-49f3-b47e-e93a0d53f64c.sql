-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS private;

-- User Profiles Table
CREATE TABLE public.profiles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    farm_size NUMERIC(10,2),
    soil_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Recommendation Table
CREATE TABLE public.crop_recommendations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    soil_type TEXT,
    season TEXT,
    avg_temperature NUMERIC(5,2),
    avg_rainfall NUMERIC(5,2),
    recommended_crop TEXT,
    suitability_score NUMERIC(5,2),
    recommendation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Cultivation Plan Table
CREATE TABLE public.crop_cultivation_plans (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    crop_recommendation_id BIGINT REFERENCES public.crop_recommendations(id),
    day_number INTEGER,
    activity TEXT,
    description TEXT,
    estimated_duration INTERVAL,
    required_resources TEXT[]
);

-- Fertilizer Recommendation Table
CREATE TABLE public.fertilizer_recommendations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    crop_name TEXT,
    soil_type TEXT,
    growth_stage TEXT,
    fertilizer_type TEXT,
    quantity_per_acre NUMERIC(10,2),
    application_method TEXT,
    timing TEXT
);

-- Crop Disease Detection Table
CREATE TABLE public.crop_diseases (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    crop_name TEXT,
    disease_name TEXT,
    symptoms TEXT,
    prevention_methods TEXT,
    treatment_methods TEXT,
    risk_level TEXT
);

-- Crop Growth Tracking Table
CREATE TABLE public.crop_growth_tracking (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    crop_name TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    current_growth_stage TEXT,
    health_status TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cultivation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_growth_tracking ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_crop_recommendations_user_id ON public.crop_recommendations(user_id);
CREATE INDEX idx_crop_growth_tracking_user_id ON public.crop_growth_tracking(user_id);