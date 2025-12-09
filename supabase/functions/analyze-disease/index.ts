import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { diseaseAnalysisSchema, validateStorageUrl } from "../_shared/validation.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = diseaseAnalysisSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrls, cropType } = validation.data;

    // Validate all image URLs are from storage bucket
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const invalidUrls = imageUrls.filter(url => !validateStorageUrl(url, supabaseUrl));
    if (invalidUrls.length > 0) {
      return new Response(
        JSON.stringify({ error: 'All image URLs must be from your storage bucket' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    // Support both single image (backward compatibility) and multiple images
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    console.log(`Analyzing ${urls.length} image(s) for crop:`, cropType);

    // Build content array with text prompt and all images
    const contentArray = [
      {
        type: 'text',
        text: `You are an expert agricultural pathologist. Analyze ${urls.length > 1 ? 'these' : 'this'} ${cropType || 'crop'} plant image${urls.length > 1 ? 's' : ''} from different angles for diseases, pests, or health issues.

${urls.length > 1 ? 'Consider all images together to provide a comprehensive analysis.' : ''}

Provide your analysis as a JSON object with these exact keys:
- detectedDisease: string (disease name or "Healthy" if no disease)
- confidenceScore: number (0-100)
- symptoms: string (describe what you observe in detail across all images)
- treatmentRecommendation: string (specific treatment advice with 2-3 actionable steps)
- preventionMethods: string (2-3 prevention strategies)

Return ONLY the JSON object, no additional text.`
      }
    ];

    // Add all images to the content array
    urls.forEach((url: string) => {
      contentArray.push({
        type: 'image_url',
        image_url: { url }
      });
    });

    // Call Lovable AI Gateway with GPT-5-mini (reliable for vision analysis)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'user',
            content: contentArray
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error status:', response.status);
      console.error('Lovable AI API error details:', errorData);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No analysis result from AI');
    }

    console.log('Raw AI response:', content);

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
        error: 'Unable to analyze the image. Please try again later.',
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