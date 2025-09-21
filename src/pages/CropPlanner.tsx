import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  Beaker, 
  Shield, 
  Loader, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Target,
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const CropPlanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('');
  const [duration, setDuration] = useState('');
  const [plan, setPlan] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [diseases, setDiseases] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get data from navigation state (from Dashboard recommendations)
  const recommendedCrop = location.state?.recommendedCrop;
  const cultivationPlan = location.state?.cultivationPlan;
  const soilData = location.state?.soilData;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Pre-populate with recommended crop if available
    if (recommendedCrop) {
      setCrop(recommendedCrop);
    }
  }, [recommendedCrop]);

  const handlePlan = async () => {
    if (!crop || !season || !duration) return;
    
    setLoading(true);
    try {
      // Store crop recommendation in database instead of external API
      const { data, error } = await supabase
        .from('crop_recommendations')
        .insert({
          user_id: user?.id,
          recommended_crop: crop,
          season: season,
          avg_temperature: 25, // Default values - could be enhanced with real data
          avg_rainfall: 100,
          soil_type: 'mixed',
          suitability_score: 85
        })
        .select()
        .single();

      if (error) throw error;

      setPlan(`Crop plan created successfully for ${crop} in ${season} season. Duration: ${duration} days. Plan ID: ${data.id}`);
      toast({
        title: "Success",
        description: "Crop plan generated and saved successfully!"
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      setPlan('Error generating plan. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate crop plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizer = async () => {
    if (!crop) return;
    
    setLoading(true);
    try {
      // Get fertilizer recommendations from database
      const { data, error } = await supabase
        .from('fertilizer_recommendations')
        .select('*')
        .eq('crop_name', crop.toLowerCase())
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const rec = data[0];
        setFertilizer(
          `Fertilizer Type: ${rec.fertilizer_type}\n` +
          `Growth Stage: ${rec.growth_stage}\n` +
          `Quantity per Acre: ${rec.quantity_per_acre}\n` +
          `Application Method: ${rec.application_method}\n` +
          `Timing: ${rec.timing}`
        );
      } else {
        setFertilizer('No specific fertilizer recommendations found for this crop in our database.');
      }

      toast({
        title: "Success",
        description: "Fertilizer recommendations retrieved successfully!"
      });
    } catch (error) {
      console.error('Error getting fertilizer recommendations:', error);
      setFertilizer('Error getting recommendations. Please try again.');
      toast({
        title: "Error",
        description: "Failed to get fertilizer recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseDetection = async () => {
    if (!crop) return;
    
    setLoading(true);
    try {
      // Get disease prevention info from database
      const { data, error } = await supabase
        .from('crop_diseases')
        .select('*')
        .eq('crop_name', crop.toLowerCase())
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        const diseaseInfo = data.map(disease => 
          `Disease: ${disease.disease_name}\n` +
          `Risk Level: ${disease.risk_level}\n` +
          `Symptoms: ${disease.symptoms}\n` +
          `Prevention: ${disease.prevention_methods}\n` +
          `Treatment: ${disease.treatment_methods}\n`
        ).join('\n---\n');
        
        setDiseases(diseaseInfo);
      } else {
        setDiseases('No specific disease information found for this crop in our database.');
      }

      toast({
        title: "Success",
        description: "Disease prevention information retrieved successfully!"
      });
    } catch (error) {
      console.error('Error getting disease prevention info:', error);
      setDiseases('Error getting prevention info. Please try again.');
      toast({
        title: "Error",
        description: "Failed to get disease prevention information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Smart Crop Planner
              </h1>
              <p className="text-muted-foreground">
                {recommendedCrop 
                  ? `Detailed cultivation plan for ${recommendedCrop} based on your soil analysis`
                  : 'Get AI-powered recommendations for crop lifecycle planning, fertilizer guidance, and disease prevention'
                }
              </p>
            </div>
            {recommendedCrop && (
              <Button 
                variant="outline"
                onClick={() => navigate('/crop-management')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Add to My Crops
              </Button>
            )}
          </div>
        </div>

        {/* Soil-based Recommendation Display */}
        {recommendedCrop && cultivationPlan && soilData && (
          <>
            {/* Soil Analysis Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Beaker className="w-5 h-5 mr-2 text-blue-600" />
                  Soil Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{soilData.ph_level}</p>
                    <p className="text-sm text-muted-foreground">pH Level</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{soilData.nitrogen_level}</p>
                    <p className="text-sm text-muted-foreground">Nitrogen (kg/ha)</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{soilData.phosphorus_level}</p>
                    <p className="text-sm text-muted-foreground">Phosphorus (kg/ha)</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{soilData.potassium_level}</p>
                    <p className="text-sm text-muted-foreground">Potassium (kg/ha)</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {soilData.location} • {soilData.soil_type} soil
                  </div>
                  <div>
                    Test Date: {new Date(soilData.test_date).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cultivation Plan Timeline */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  {recommendedCrop} Cultivation Timeline
                </CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {cultivationPlan.length} weeks plan
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cultivationPlan.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {step.week}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{step.activity}</h4>
                          <Badge variant="outline">
                            Week {step.week}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-success" />
                    Fertilizer Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleFertilizer}
                    disabled={loading}
                    className="w-full mb-4"
                    variant="outline"
                  >
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Get Fertilizer Plan'
                    )}
                  </Button>
                  {fertilizer && (
                    <div className="p-4 rounded-md bg-success/10 border border-success/20">
                      <pre className="whitespace-pre-wrap text-sm text-success-foreground">{fertilizer}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Disease Prevention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleDiseaseDetection}
                    disabled={loading}
                    className="w-full mb-4"
                    variant="outline"
                  >
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Get Disease Prevention Plan'
                    )}
                  </Button>
                  {diseases && (
                    <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                      <pre className="whitespace-pre-wrap text-sm text-destructive-foreground">{diseases}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Manual Planning Section - shown when no recommendation passed */}
        {!recommendedCrop && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-earth" />
                  Plan Your Crop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Crop Name (e.g., Wheat, Rice, Tomato)"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Season (e.g., Rabi, Kharif, Summer)"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Duration (in days)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {/* Lifecycle Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Generate Crop Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handlePlan}
                    disabled={loading || !crop || !season || !duration}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      'Generate Lifecycle Plan'
                    )}
                  </Button>
                  {plan && (
                    <div className="mt-4 p-4 rounded-md bg-muted border">
                      <pre className="whitespace-pre-wrap text-sm">{plan}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Fertilizer Recommendation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5 text-success" />
                      Fertilizer Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleFertilizer}
                      disabled={loading || !crop}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Get Fertilizer Plan'
                      )}
                    </Button>
                    {fertilizer && (
                      <div className="mt-4 p-4 rounded-md bg-success/10 border border-success/20">
                        <pre className="whitespace-pre-wrap text-sm text-success-foreground">{fertilizer}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Disease Prevention */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-destructive" />
                      Disease Prevention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleDiseaseDetection}
                      disabled={loading || !crop}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Check Disease & Prevention'
                      )}
                    </Button>
                    {diseases && (
                      <div className="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive/20">
                        <pre className="whitespace-pre-wrap text-sm text-destructive-foreground">{diseases}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Get Soil-Based Recommendations CTA */}
        {!recommendedCrop && (
          <Card className="mt-8 bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-200">
            <CardContent className="text-center py-8">
              <Beaker className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Want Personalized Recommendations?
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your soil test data to get AI-powered crop recommendations based on your specific soil conditions.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/soil-data')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Soil Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CropPlanner;