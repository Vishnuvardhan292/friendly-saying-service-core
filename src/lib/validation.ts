import { z } from 'zod';

// Soil data validation schema
export const soilDataSchema = z.object({
  ph_level: z.number().min(0).max(14).optional().nullable(),
  nitrogen_level: z.number().min(0).max(1000).optional().nullable(),
  phosphorus_level: z.number().min(0).max(1000).optional().nullable(), 
  potassium_level: z.number().min(0).max(1000).optional().nullable(),
  organic_matter_percentage: z.number().min(0).max(100).optional().nullable(),
  soil_type: z.string().min(1).max(50).trim(),
  soil_texture: z.string().min(1).max(50).trim(),
  drainage_quality: z.string().min(1).max(50).trim(),
  location: z.string().min(1).max(200).trim(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  notes: z.string().max(1000).trim().optional()
});

// Crop data validation schema
export const cropDataSchema = z.object({
  crop_name: z.string().min(1).max(100).trim(),
  season: z.string().min(1).max(50).trim(),
  duration: z.string().min(1).max(10).trim(),
  planting_date: z.string().optional(),
  expected_harvest_date: z.string().optional()
});

// Profile data validation schema
export const profileDataSchema = z.object({
  full_name: z.string().min(1).max(100).trim(),
  phone: z.string().min(10).max(15).trim().optional(),
  location: z.string().min(1).max(200).trim(),
  farm_size: z.number().min(0).max(100000).optional(),
  soil_type: z.string().min(1).max(50).trim()
});

// Farm task validation schema
export const farmTaskSchema = z.object({
  task_description: z.string().min(1).max(500).trim(),
  task_type: z.string().min(1).max(50).trim(),
  scheduled_date: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  crop_name: z.string().min(1).max(100).trim().optional(),
  estimated_duration: z.string().optional(),
  notes: z.string().max(1000).trim().optional()
});

// Inventory validation schema
export const inventorySchema = z.object({
  item_name: z.string().min(1).max(100).trim(),
  item_type: z.string().min(1).max(50).trim(),
  quantity: z.number().min(0).max(999999),
  unit: z.string().min(1).max(20).trim(),
  cost_per_unit: z.number().min(0).max(999999).optional(),
  supplier: z.string().max(100).trim().optional(),
  purchase_date: z.string().optional(),
  expiry_date: z.string().optional(),
  current_location: z.string().max(100).trim().optional(),
  condition: z.string().max(50).trim().optional(),
  notes: z.string().max(500).trim().optional()
});

// Sanitization function for text inputs
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

// Sanitization function for numbers
export const sanitizeNumber = (value: any): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Validation helper function
export const validateAndSanitizeInput = <T>(
  data: any,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};