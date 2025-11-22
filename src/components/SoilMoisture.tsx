import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplets, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SoilMoistureReading {
  value: number;
  timestamp: Date;
  sensorId?: string;
}

interface SoilMoistureProps {
  fieldLocation?: string;
  onReadingUpdate?: (reading: SoilMoistureReading) => void;
}

const SoilMoisture: React.FC<SoilMoistureProps> = ({ fieldLocation, onReadingUpdate }) => {
  const [moistureLevel, setMoistureLevel] = useState<number>(45);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastReading, setLastReading] = useState<Date>(new Date());
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [readings, setReadings] = useState<number[]>([45, 43, 46, 44, 45]);
  const { toast } = useToast();

  // Simulate hardware connection (replace with actual IoT integration)
  useEffect(() => {
    const connectInterval = setInterval(() => {
      // Simulate connection status (replace with actual hardware connection check)
      const connected = Math.random() > 0.1; // 90% connection rate
      setIsConnected(connected);
    }, 5000);

    return () => clearInterval(connectInterval);
  }, []);

  // Simulate periodic readings from hardware sensor
  useEffect(() => {
    if (!isConnected) return;

    const readingInterval = setInterval(() => {
      // Simulate sensor reading (replace with actual hardware data)
      const newReading = moistureLevel + (Math.random() - 0.5) * 4;
      const clampedReading = Math.max(0, Math.min(100, newReading));
      
      updateMoistureLevel(clampedReading);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(readingInterval);
  }, [isConnected, moistureLevel]);

  const updateMoistureLevel = (newValue: number) => {
    const previousValue = moistureLevel;
    setMoistureLevel(newValue);
    setLastReading(new Date());
    
    // Update trend
    if (newValue > previousValue + 2) {
      setTrend('up');
    } else if (newValue < previousValue - 2) {
      setTrend('down');
    } else {
      setTrend('stable');
    }

    // Update readings history
    setReadings(prev => [...prev.slice(-4), newValue]);

    // Trigger callback
    if (onReadingUpdate) {
      onReadingUpdate({
        value: newValue,
        timestamp: new Date(),
        sensorId: 'sensor-01'
      });
    }

    // Show alerts for extreme values
    if (newValue < 20) {
      toast({
        variant: 'destructive',
        title: 'Low Soil Moisture',
        description: `Moisture level is ${newValue.toFixed(1)}%. Irrigation recommended.`,
      });
    } else if (newValue > 80) {
      toast({
        title: 'High Soil Moisture',
        description: `Moisture level is ${newValue.toFixed(1)}%. Reduce watering.`,
      });
    }
  };

  const handleManualRefresh = () => {
    toast({
      title: 'Refreshing...',
      description: 'Fetching latest reading from sensor.',
    });
    
    // Simulate fetching new data
    setTimeout(() => {
      const newReading = 30 + Math.random() * 40;
      updateMoistureLevel(newReading);
      toast({
        title: 'Updated',
        description: 'Latest moisture reading received.',
      });
    }, 1000);
  };

  const getMoistureStatus = () => {
    if (moistureLevel < 20) return { label: 'Critical', color: 'destructive', icon: AlertTriangle };
    if (moistureLevel < 40) return { label: 'Low', color: 'default', icon: TrendingDown };
    if (moistureLevel < 70) return { label: 'Optimal', color: 'secondary', icon: Droplets };
    return { label: 'High', color: 'default', icon: TrendingUp };
  };

  const status = getMoistureStatus();
  const StatusIcon = status.icon;

  const getProgressColor = () => {
    if (moistureLevel < 20) return 'bg-destructive';
    if (moistureLevel < 40) return 'bg-orange-500';
    if (moistureLevel < 70) return 'bg-success';
    return 'bg-blue-500';
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Droplets className="w-5 h-5 mr-2 text-primary" />
            Soil Moisture
            {fieldLocation && (
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                - {fieldLocation}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleManualRefresh}
              disabled={!isConnected}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Reading */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="text-5xl font-bold text-primary">
                {moistureLevel.toFixed(1)}
                <span className="text-2xl text-muted-foreground ml-1">%</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={status.color as any}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
              {trend !== 'stable' && (
                <Badge variant="outline">
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1 text-destructive" />
                  )}
                  {trend === 'up' ? 'Rising' : 'Falling'}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dry</span>
              <span>Optimal Range</span>
              <span>Saturated</span>
            </div>
            <Progress value={moistureLevel} className="h-3" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">0%</span>
              <span className="text-success font-medium">40-70%</span>
              <span className="text-muted-foreground">100%</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Droplets className="w-4 h-4 mr-1 text-primary" />
              Recommendation
            </h4>
            <p className="text-sm text-muted-foreground">
              {moistureLevel < 20 && 'Critical moisture level. Water immediately to prevent crop stress.'}
              {moistureLevel >= 20 && moistureLevel < 40 && 'Moisture level is low. Schedule irrigation within 24 hours.'}
              {moistureLevel >= 40 && moistureLevel < 70 && 'Soil moisture is in optimal range. Continue regular monitoring.'}
              {moistureLevel >= 70 && 'Soil is well-saturated. Reduce or skip next watering cycle.'}
            </p>
          </div>

          {/* Last Reading Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Last reading</span>
            <span>{lastReading.toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilMoisture;
