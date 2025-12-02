import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { weatherRequestSchema } from "../_shared/validation.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    const validation = weatherRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { location } = validation.data;
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    console.log('API Key status:', apiKey ? 'Found' : 'Missing')
    
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured. Please add OPENWEATHER_API_KEY secret in Supabase.')
    }

    // Get coordinates from location name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    console.log('Geocoding URL:', geoUrl)
    
    const geoResponse = await fetch(geoUrl)
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status}`)
    }
    
    const geoData = await geoResponse.json()
    console.log('Geocoding response:', geoData)
    
    if (!geoData || !Array.isArray(geoData) || geoData.length === 0) {
      throw new Error(`Location "${location}" not found. Please try a different location name.`)
    }

    const firstResult = geoData[0]
    if (!firstResult || typeof firstResult.lat !== 'number' || typeof firstResult.lon !== 'number') {
      throw new Error('Invalid location data received from geocoding service')
    }

    const { lat, lon } = firstResult

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const weatherResponse = await fetch(weatherUrl)
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }
    
    const weatherData = await weatherResponse.json()

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const forecastResponse = await fetch(forecastUrl)
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`)
    }
    
    const forecastData = await forecastResponse.json()

    const result = {
      current: {
        temperature: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        wind_speed: weatherData.wind.speed,
        wind_direction: weatherData.wind.deg,
        visibility: weatherData.visibility / 1000, // Convert to km
        uv_index: 0, // Not available in free tier
        rain_chance: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
      },
      forecast: forecastData.list.slice(0, 8).map((item: any) => ({
        datetime: item.dt_txt,
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        rain_chance: item.pop * 100, // Probability of precipitation
      })),
      location: {
        name: firstResult.name,
        country: firstResult.country,
        lat,
        lon,
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Weather API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Unable to retrieve weather data. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})