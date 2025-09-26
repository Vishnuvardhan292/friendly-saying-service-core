import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, cropType } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing disease for crop:', cropType, 'Image:', imageUrl);

    // Call OpenAI Vision API for disease analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural pathologist specializing in crop disease identification. Analyze the provided image of a ${cropType || 'crop'} plant and provide:
            1. Disease identification (if any)
            2. Confidence score (0-100)
            3. Symptoms observed
            4. Treatment recommendations
            5. Prevention methods
            
            Return your response as a valid JSON object with these exact keys:
            - detectedDisease: string (disease name or "Healthy" if no disease)
            - confidenceScore: number (0-100)
            - symptoms: string (describe what you observe)
            - treatmentRecommendation: string (specific treatment advice)
            - preventionMethods: string (prevention strategies)`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this ${cropType || 'crop'} plant image for diseases, pests, or health issues.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No analysis result from OpenAI');
    }

    console.log('Raw OpenAI response:', content);

    // Parse the JSON response from OpenAI
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if not JSON format
        analysisResult = {
          detectedDisease: "Analysis completed",
          confidenceScore: 75,
          symptoms: content.substring(0, 200),
          treatmentRecommendation: "Please consult with a local agricultural expert for specific treatment recommendations.",
          preventionMethods: "Maintain proper plant spacing, ensure good drainage, and monitor regularly for early signs of disease."
        };
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback response
      analysisResult = {
        detectedDisease: "Analysis completed",
        confidenceScore: 70,
        symptoms: "Image analysis completed. Please review the recommendations.",
        treatmentRecommendation: content.length > 100 ? content.substring(0, 200) + "..." : content,
        preventionMethods: "Follow standard agricultural best practices for this crop type."
      };
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Disease analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as any).message || 'Analysis failed',
        detectedDisease: "Analysis Error",
        confidenceScore: 0,
        symptoms: "Unable to analyze image",
        treatmentRecommendation: "Please try again with a clearer image",
        preventionMethods: "Ensure good image quality for accurate analysis"
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});