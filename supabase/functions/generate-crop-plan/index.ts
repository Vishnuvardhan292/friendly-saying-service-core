import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropName, variety, plantingDate, expectedHarvestDate, soilType, location } = await req.json();
    
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
