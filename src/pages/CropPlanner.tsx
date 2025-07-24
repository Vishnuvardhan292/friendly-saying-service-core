import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Beaker, Shield, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CropPlanner = () => {
  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('');
  const [duration, setDuration] = useState('');
  const [plan, setPlan] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [diseases, setDiseases] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/crop-lifecycle`,
        { crop, season, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(response.data.result);
    } catch (err: any) {
      setPlan('Error: ' + (err.response?.data?.error || 'Failed to get lifecycle plan'));
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizer = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/fertilizer-recommendation`,
        { crop },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFertilizer(response.data.result);
    } catch (err: any) {
      setFertilizer('Error: ' + (err.response?.data?.error || 'Failed to get fertilizer guidance'));
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseDetection = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/disease-prevention`,
        { crop },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiseases(response.data.result);
    } catch (err: any) {
      setDiseases('Error: ' + (err.response?.data?.error || 'Failed to get disease detection info'));
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