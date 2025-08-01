import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
    rain_chance: number;
  };
  forecast: Array<{
    datetime: string;
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    rain_chance: number;
  }>;
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
}

export const useWeather = (location?: string) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (loc: string) => {
    if (!loc) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('get-weather', {
        body: { location: loc }
      });

      if (functionError) throw functionError;
      
      setWeather(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location);
    }
  }, [location]);

  return {
    weather,
    loading,
    error,
    refetch: () => location && fetchWeather(location),
    fetchWeather: (newLocation: string) => fetchWeather(newLocation)
  };
};