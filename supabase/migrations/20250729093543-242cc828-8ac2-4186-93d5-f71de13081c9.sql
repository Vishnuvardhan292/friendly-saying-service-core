-- Soil Test Data Table
CREATE TABLE public.soil_tests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    test_date DATE DEFAULT CURRENT_DATE,
    location TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    
    -- Soil Composition
    ph_level NUMERIC(4, 2),
    organic_matter_percentage NUMERIC(5, 2),
    
    -- Nutrient Levels
    nitrogen_level NUMERIC(5, 2),
    phosphorus_level NUMERIC(5, 2),
    potassium_level NUMERIC(5, 2),
    
    -- Soil Characteristics
    soil_type TEXT,
    soil_texture TEXT,
    drainage_quality TEXT,
    
    -- Additional Metadata
    report_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Task Scheduler Table
CREATE TABLE public.farm_tasks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    crop_name TEXT,
    task_type TEXT, -- e.g., 'irrigation', 'fertilization', 'pest_control', 'harvesting'
    task_description TEXT,
    scheduled_date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    assigned_to TEXT, -- can be user or automated system
    estimated_duration INTERVAL,
    required_resources TEXT[],
    
    -- Tracking and Notifications
    reminder_sent BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Fertilizer Recommendation Table
CREATE TABLE public.advanced_fertilizer_recommendations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    crop_name TEXT,
    growth_stage TEXT, -- 'seedling', 'vegetative', 'flowering', 'fruiting', 'harvesting'
    soil_type TEXT,
    
    -- Nutrient Recommendations
    nitrogen_recommendation NUMERIC(6, 2), -- kg per hectare
    phosphorus_recommendation NUMERIC(6, 2),
    potassium_recommendation NUMERIC(6, 2),
    
    -- Organic vs Inorganic
    organic_fertilizer_mix TEXT[],
    chemical_fertilizer_mix TEXT[],
    
    -- Application Details
    application_method TEXT, -- 'broadcast', 'row', 'foliar spray'
    application_timing TEXT,
    
    -- Environmental Considerations
    water_requirement NUMERIC(6, 2), -- liters per hectare
    climate_suitability TEXT[],
    
    -- Additional Guidance
    precautions TEXT,
    expected_yield_improvement NUMERIC(5, 2) -- percentage
);

-- Farm Inventory Management
CREATE TABLE public.farm_inventory (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    item_name TEXT,
    item_type TEXT, -- 'seed', 'fertilizer', 'tool', 'equipment'
    quantity NUMERIC(10, 2),
    unit TEXT, -- 'kg', 'liter', 'piece'
    purchase_date DATE,
    expiry_date DATE,
    supplier TEXT,
    cost_per_unit NUMERIC(10, 2),
    
    -- Tracking
    current_location TEXT,
    condition TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user data access
CREATE POLICY "Users can view their own soil tests" 
ON public.soil_tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own soil tests" 
ON public.soil_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own soil tests" 
ON public.soil_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own soil tests" 
ON public.soil_tests 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own farm tasks" 
ON public.farm_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm tasks" 
ON public.farm_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm tasks" 
ON public.farm_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm tasks" 
ON public.farm_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own inventory" 
ON public.farm_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" 
ON public.farm_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.farm_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" 
ON public.farm_inventory 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fertilizer recommendations are public reference data
CREATE POLICY "Anyone can view fertilizer recommendations" 
ON public.advanced_fertilizer_recommendations 
FOR SELECT 
USING (true);

-- Create Indexes
CREATE INDEX idx_soil_tests_user_id ON public.soil_tests(user_id);
CREATE INDEX idx_farm_tasks_user_id ON public.farm_tasks(user_id);
CREATE INDEX idx_farm_inventory_user_id ON public.farm_inventory(user_id);
CREATE INDEX idx_farm_tasks_scheduled_date ON public.farm_tasks(scheduled_date);
CREATE INDEX idx_soil_tests_test_date ON public.soil_tests(test_date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_soil_tests_updated_at
    BEFORE UPDATE ON public.soil_tests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farm_tasks_updated_at
    BEFORE UPDATE ON public.farm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farm_inventory_updated_at
    BEFORE UPDATE ON public.farm_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();