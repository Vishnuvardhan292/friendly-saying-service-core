import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { MapPin, Upload, Loader2, TestTube, FileText } from 'lucide-react';

interface SoilTestData {
  location: string;
  latitude: number | null;
  longitude: number | null;
  ph_level: number | null;
  organic_matter_percentage: number | null;
  nitrogen_level: number | null;
  phosphorus_level: number | null;
  potassium_level: number | null;
  soil_type: string;
  soil_texture: string;
  drainage_quality: string;
  notes: string;
  report_file_url: string;
}

const SoilData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState<SoilTestData>({
    location: '',
    latitude: null,
    longitude: null,
    ph_level: null,
    organic_matter_percentage: null,
    nitrogen_level: null,
    phosphorus_level: null,
    potassium_level: null,
    soil_type: '',
    soil_texture: '',
    drainage_quality: '',
    notes: '',
    report_file_url: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [navigate]);

  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: prev.location || `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }));
          setIsLocationLoading(false);
          toast({
            title: "Location captured",
            description: "GPS coordinates have been added to your soil test."
          });
        },
        (error) => {
          setIsLocationLoading(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLocationLoading(false);
      toast({
        title: "GPS Not Available",
        description: "Your device doesn't support GPS location.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('soil_tests')
        .insert([{
          user_id: user.id,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: "Soil Test Saved",
        description: "Your soil data has been recorded successfully!"
      });

      // Reset form
      setFormData({
        location: '',
        latitude: null,
        longitude: null,
        ph_level: null,
        organic_matter_percentage: null,
        nitrogen_level: null,
        phosphorus_level: null,
        potassium_level: null,
        soil_type: '',
        soil_texture: '',
        drainage_quality: '',
        notes: '',
        report_file_url: ''
      });

      // Navigate to dashboard or crop recommendations
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🧪 Soil Test Data Collection
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter your soil test results to get personalized crop recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Field Location
                </CardTitle>
                <CardDescription>
                  Specify the location where the soil sample was taken
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location Name/Description</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Main Field, North Plot, Village Name"
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                      placeholder="e.g., 28.6139"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                      placeholder="e.g., 77.2090"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isLocationLoading}
                    >
                      {isLocationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      Get GPS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soil Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Soil Composition
                </CardTitle>
                <CardDescription>
                  Enter the chemical composition of your soil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ph_level">pH Level (0-14)</Label>
                    <Input
                      id="ph_level"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={formData.ph_level || ''}
                      onChange={(e) => handleInputChange('ph_level', parseFloat(e.target.value))}
                      placeholder="e.g., 6.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organic_matter">Organic Matter (%)</Label>
                    <Input
                      id="organic_matter"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.organic_matter_percentage || ''}
                      onChange={(e) => handleInputChange('organic_matter_percentage', parseFloat(e.target.value))}
                      placeholder="e.g., 2.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrient Levels */}
            <Card>
              <CardHeader>
                <CardTitle>NPK Nutrient Levels</CardTitle>
                <CardDescription>
                  Primary macronutrients in your soil (mg/kg or ppm)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nitrogen_level || ''}
                      onChange={(e) => handleInputChange('nitrogen_level', parseFloat(e.target.value))}
                      placeholder="e.g., 45.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.phosphorus_level || ''}
                      onChange={(e) => handleInputChange('phosphorus_level', parseFloat(e.target.value))}
                      placeholder="e.g., 28.7"
                    />
                  </div>
                  <div>
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.potassium_level || ''}
                      onChange={(e) => handleInputChange('potassium_level', parseFloat(e.target.value))}
                      placeholder="e.g., 195.3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soil Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>Soil Characteristics</CardTitle>
                <CardDescription>
                  Physical properties of your soil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="soil_type">Soil Type</Label>
                    <Select value={formData.soil_type} onValueChange={(value) => handleInputChange('soil_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alluvial">Alluvial</SelectItem>
                        <SelectItem value="black">Black/Regur</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="laterite">Laterite</SelectItem>
                        <SelectItem value="desert">Desert/Arid</SelectItem>
                        <SelectItem value="mountain">Mountain/Hill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="soil_texture">Soil Texture</Label>
                    <Select value={formData.soil_texture} onValueChange={(value) => handleInputChange('soil_texture', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select texture" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="silty">Silty</SelectItem>
                        <SelectItem value="sandy_loam">Sandy Loam</SelectItem>
                        <SelectItem value="clay_loam">Clay Loam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="drainage">Drainage Quality</Label>
                    <Select value={formData.drainage_quality} onValueChange={(value) => handleInputChange('drainage_quality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drainage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="very_poor">Very Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <CardDescription>
                  Optional details and file uploads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report_url">Soil Test Report URL</Label>
                  <Input
                    id="report_url"
                    type="url"
                    value={formData.report_file_url}
                    onChange={(e) => handleInputChange('report_file_url', e.target.value)}
                    placeholder="https://example.com/soil-report.pdf"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional observations about your soil, field conditions, or previous crops..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Soil Data
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SoilData;