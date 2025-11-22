import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const weatherRequestSchema = z.object({
  location: z.string().trim().min(1).max(100),
});

export const diseaseAnalysisSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(5),
  cropType: z.string().trim().min(1).max(30),
});

export const cropPlanRequestSchema = z.object({
  cropName: z.string().trim().min(1).max(50),
  variety: z.string().trim().max(50).optional(),
  plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expectedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  soilType: z.string().trim().max(50),
  location: z.string().trim().max(100),
});

export const weatherNotificationSchema = z.object({
  user_id: z.string().uuid(),
  location: z.string().trim().min(1).max(100).optional(),
});

export function validateDateRange(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  const fiveYearsAhead = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
  return date >= fiveYearsAgo && date <= fiveYearsAhead;
}

export function validateStorageUrl(url: string, supabaseUrl: string): boolean {
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
}
