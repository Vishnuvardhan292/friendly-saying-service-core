import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Thermometer, Droplets, Wind, Eye, Gauge } from 'lucide-react';

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

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const WeatherWidget = ({ weather, loading, error }: WeatherWidgetProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-sky" />
            Weather Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-sky" />
            Weather Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Unable to load weather</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-sky" />
            Weather Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="font-semibold">--°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Humidity</span>
              </div>
              <span className="font-semibold">--%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, location } = weather;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CloudRain className="w-5 h-5 mr-2 text-sky" />
            Weather Today
          </div>
          <Badge variant="outline" className="text-xs">
            {location.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main temperature display */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{current.temperature}°C</div>
              <p className="text-sm text-muted-foreground capitalize">
                {current.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Feels like {current.feels_like}°C
              </p>
            </div>
            <img 
              src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
              alt={current.description}
              className="w-16 h-16"
            />
          </div>

          {/* Weather details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Humidity</span>
              </div>
              <span className="font-semibold">{current.humidity}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Wind Speed</span>
              </div>
              <span className="font-semibold">{current.wind_speed} m/s</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Rain Chance</span>
              </div>
              <span className="font-semibold">{Math.round(current.rain_chance)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Pressure</span>
              </div>
              <span className="font-semibold">{current.pressure} hPa</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Visibility</span>
              </div>
              <span className="font-semibold">{current.visibility} km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;