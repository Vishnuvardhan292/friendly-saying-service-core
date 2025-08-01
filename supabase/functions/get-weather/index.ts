import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { location } = await req.json()
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    // Get coordinates from location name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    const geoResponse = await fetch(geoUrl)
    const geoData = await geoResponse.json()
    
    if (!geoData || geoData.length === 0) {
      throw new Error('Location not found')
    }

    const { lat, lon } = geoData[0]

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const forecastResponse = await fetch(forecastUrl)
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
        name: geoData[0].name,
        country: geoData[0].country,
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
      JSON.stringify({ error: 'Failed to fetch weather data', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})