import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { cropPlanRequestSchema, validateDateRange } from "../_shared/validation.ts"

const allowedOrigins = [
  'https://tkydokfyorlolbarcazl.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080'
];

const getCorsHeaders = (origin: string | null) => {
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = cropPlanRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { cropName, variety, plantingDate, expectedHarvestDate, soilType, location } = validation.data;

    // Validate date ranges
    if (!validateDateRange(plantingDate) || !validateDateRange(expectedHarvestDate)) {
      return new Response(
        JSON.stringify({ error: 'Dates must be within 5 years of current date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert agricultural advisor. Generate a comprehensive day-by-day cultivation plan for crops. Return a JSON array of activities with this structure:
    [{
      "day_number": 1,
      "activity": "Activity name",
      "description": "Detailed description",
      "required_resources": ["resource1", "resource2"],
      "estimated_duration": "2 hours"
    }]
    
    Guidelines:
    - Start from day 1 (planting day)
    - Include all critical activities: land preparation, planting, irrigation, fertilization, pest control, monitoring, harvesting
    - Space activities realistically throughout the growing period
    - Be specific about quantities and methods
    - Include preventive measures
    - Return ONLY the JSON array, no other text`;

    const userPrompt = `Generate a complete cultivation plan for:
    Crop: ${cropName} ${variety ? `(${variety})` : ''}
    Planting Date: ${plantingDate}
    Expected Harvest: ${expectedHarvestDate}
    Soil Type: ${soilType}
    Location: ${location}
    
    Calculate the total growing days and distribute activities appropriately. Include:
    1. Pre-planting activities (days 1-7)
    2. Planting activities (day 7-10)
    3. Early growth care (first month)
    4. Mid-season management
    5. Pre-harvest preparation
    6. Harvest activities`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const plan = JSON.parse(jsonMatch[0]);
    
    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating crop plan:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to generate crop plan. Please try again later.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
