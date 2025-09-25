import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const body = await req.json();
    
    // Input validation and sanitization
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { user_id, location } = body;

    // Validate user_id
    if (!user_id || typeof user_id !== 'string' || user_id.length < 1 || user_id.length > 100) {
      throw new Error('Valid user ID is required');
    }

    // Validate and sanitize location if provided
    if (location && (typeof location !== 'string' || location.length > 200)) {
      throw new Error('Location must be a valid string under 200 characters');
    }

    // Basic XSS prevention for location input
    if (location && /<script|javascript:|on\w+=/i.test(location)) {
      throw new Error('Invalid location format');
    }

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENWEATHER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    // Default to a sample location if none provided, with additional sanitization
    const weatherLocation = (location && location.trim()) || 'London,UK';
    
    // Additional validation for weather API call
    if (weatherLocation.length > 100) {
      throw new Error('Location name too long');
    }

    console.log(`Fetching weather data for user ${user_id} at location: ${weatherLocation}`);

    // Get weather data from OpenWeatherMap with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weatherLocation)}&appid=${OPENWEATHER_API_KEY}&units=metric`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    
    // Analyze weather conditions and create notifications
    const notifications = [];
    const { weather, main, wind } = weatherData;
    
    // Check for severe weather conditions
    if (weather[0]?.main === 'Rain' && main.humidity > 80) {
      notifications.push({
        type: 'weather_alert',
        title: 'Heavy Rain Alert',
        message: `Heavy rain detected in ${weatherData.name}. Consider protecting your crops and check drainage systems.`,
        severity: 'high',
        data: {
          temperature: main.temp,
          humidity: main.humidity,
          weather_condition: weather[0].main
        }
      });
    }

    if (main.temp > 35) {
      notifications.push({
        type: 'weather_alert',
        title: 'High Temperature Warning',
        message: `Temperature is ${main.temp}°C. Ensure adequate irrigation for your crops.`,
        severity: 'medium',
        data: {
          temperature: main.temp,
          humidity: main.humidity,
          weather_condition: weather[0].main
        }
      });
    }

    if (wind?.speed > 10) {
      notifications.push({
        type: 'weather_alert',
        title: 'Strong Wind Alert',
        message: `Wind speed is ${wind.speed} m/s. Secure loose equipment and check tree supports.`,
        severity: 'medium',
        data: {
          wind_speed: wind.speed,
          weather_condition: weather[0].main
        }
      });
    }

    // If no severe weather, send a general weather update
    if (notifications.length === 0) {
      notifications.push({
        type: 'weather_alert',
        title: 'Weather Update',
        message: `Current weather in ${weatherData.name}: ${weather[0].description}, ${main.temp}°C`,
        severity: 'low',
        data: {
          temperature: main.temp,
          humidity: main.humidity,
          weather_condition: weather[0].main
        }
      });
    }

    // Insert notifications into Supabase
    for (const notification of notifications) {
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/notifications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            user_id,
            ...notification,
            created_at: new Date().toISOString(),
          }),
        }
      );

      if (!insertResponse.ok) {
        console.error('Failed to insert notification:', await insertResponse.text());
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather_data: weatherData,
        notifications_sent: notifications.length,
        location: weatherData.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in weather notifications:', error);
    
    // Security: Don't expose internal error details to clients
    let errorMessage = 'An error occurred while processing your request';
    let statusCode = 500;
    
    const err = error as any;
    if (err.name === 'AbortError') {
      errorMessage = 'Request timeout';
      statusCode = 408;
    } else if (err.message && (err.message.includes('User ID') || err.message.includes('location') || err.message.includes('Invalid'))) {
      errorMessage = err.message;
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});