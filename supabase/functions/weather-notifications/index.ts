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
    const { user_id, location } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENWEATHER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    // Default to a sample location if none provided
    const weatherLocation = location || 'London,UK';

    // Get weather data from OpenWeatherMap
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weatherLocation)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

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
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});