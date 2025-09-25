-- Fix database function security by updating search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, location, farm_size, soil_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'location',
    CASE 
      WHEN NEW.raw_user_meta_data->>'farm_size' != '' 
      THEN (NEW.raw_user_meta_data->>'farm_size')::numeric 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'soil_type'
  );
  RETURN NEW;
END;
$function$;