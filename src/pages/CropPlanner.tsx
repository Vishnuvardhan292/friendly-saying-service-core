import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Beaker, Shield, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CropPlanner = () => {
  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('');
  const [duration, setDuration] = useState('');
  const [plan, setPlan] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [diseases, setDiseases] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🌿 Smart Crop Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered recommendations for crop lifecycle planning, fertilizer guidance, and disease prevention
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-earth" />
                Crop Information
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

          <div className="grid gap-6 md:grid-cols-1">
            {/* Lifecycle Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Crop Lifecycle Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePlan}
                  disabled={loading || !crop || !season || !duration}
                  className="w-full"
                  variant="earth"
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
                  <div className="mt-4 p-4 rounded-md bg-earth/10 border border-earth/20">
                    <pre className="whitespace-pre-wrap text-sm text-earth-foreground">{plan}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  variant="success"
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Get Fertilizer Recommendation'
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
                  variant="destructive"
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
    </div>
  );
};

export default CropPlanner;