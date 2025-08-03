import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Leaf,
  Bug,
  Droplets,
  Sun,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { supabase } from '@/integrations/supabase/client';

const DiseaseDetection = () => {
  const { user, requireAuth } = useAuthProtection();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [cropType, setCropType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Check authentication
  if (!user) {
    requireAuth();
    return null;
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !cropType) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and specify the crop type.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      // Upload image to Supabase Storage
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('crop-images')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);

      // Simulate AI analysis (replace with actual AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults = {
        disease: "Leaf Blight",
        confidence: 87.5,
        severity: "Moderate",
        description: "A common fungal disease affecting crop leaves and reducing yield.",
        symptoms: [
          "Brown spots on leaves with dark borders",
          "Yellowing of affected areas",
          "Wilting of leaf edges",
          "Premature leaf drop"
        ],
        causes: [
          "High humidity conditions",
          "Poor air circulation",
          "Overhead watering",
          "Dense plant spacing"
        ],
        treatment: [
          "Remove affected plant parts immediately",
          "Apply copper-based fungicide spray",
          "Improve air circulation around plants",
          "Reduce watering frequency"
        ],
        prevention: [
          "Ensure proper plant spacing",
          "Water at soil level, not on leaves",
          "Apply preventive fungicide treatments",
          "Monitor plants regularly for early signs"
        ]
      };

      // Save to database
      const { error: dbError } = await supabase
        .from('disease_detections')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          crop_type: cropType,
          detected_disease: mockResults.disease,
          confidence_score: mockResults.confidence,
          symptoms: mockResults.symptoms.join('; '),
          treatment_recommendation: mockResults.treatment.join('; ')
        });

      if (dbError) throw dbError;

      setAnalysisResult(mockResults);
      
      toast({
        title: "Analysis Complete",
        description: "Disease detection completed successfully.",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const commonDiseases = [
    {
      name: "Tomato Late Blight",
      crop: "Tomato",
      severity: "High",
      symptoms: "Dark spots on leaves, white mold growth",
      image: "/placeholder.svg"
    },
    {
      name: "Powdery Mildew",
      crop: "Multiple",
      severity: "Medium",
      symptoms: "White powdery coating on leaves",
      image: "/placeholder.svg"
    },
    {
      name: "Bacterial Leaf Spot",
      crop: "Pepper",
      severity: "Medium",
      symptoms: "Small dark spots with yellow halos",
      image: "/placeholder.svg"
    },
    {
      name: "Downy Mildew",
      crop: "Cucumber",
      severity: "High",
      symptoms: "Yellow patches with fuzzy growth underneath",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Disease Detection</h1>
              <p className="text-muted-foreground">AI-powered crop disease identification and treatment recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Crop Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="crop-type">Crop Type</Label>
                  <Input
                    id="crop-type"
                    placeholder="e.g., Tomato, Wheat, Rice"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Crop Image</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Uploaded crop" 
                          className="max-w-full h-48 object-contain mx-auto rounded-lg"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Click to upload image</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <Button 
                  onClick={analyzeImage}
                  disabled={!selectedImage || !cropType || isAnalyzing}
                  className="w-full"
                  variant="hero"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                    Detection Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-destructive">{analysisResult.disease}</h4>
                      <p className="text-sm text-muted-foreground">Confidence: {analysisResult.confidence}%</p>
                    </div>
                    <Badge variant="destructive">{analysisResult.severity} Risk</Badge>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-2 flex items-center">
                      <Bug className="w-4 h-4 mr-2" />
                      Symptoms
                    </h5>
                    <ul className="space-y-1">
                      {analysisResult.symptoms.map((symptom, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-2 flex items-center">
                      <Droplets className="w-4 h-4 mr-2" />
                      Possible Causes
                    </h5>
                    <ul className="space-y-1">
                      {analysisResult.causes.map((cause, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-success" />
                      Treatment
                    </h5>
                    <ul className="space-y-1">
                      {analysisResult.treatment.map((treatment, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-foreground mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-sky" />
                      Prevention
                    </h5>
                    <ul className="space-y-1">
                      {analysisResult.prevention.map((prevention, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center">
                          <div className="w-1.5 h-1.5 bg-sky rounded-full mr-2" />
                          {prevention}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Common Diseases */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-success" />
                  Common Diseases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commonDiseases.map((disease, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{disease.name}</h4>
                          <p className="text-sm text-muted-foreground">Affects: {disease.crop}</p>
                        </div>
                        <Badge 
                          variant={disease.severity === 'High' ? 'destructive' : 'default'}
                        >
                          {disease.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{disease.symptoms}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-accent" />
                  Photography Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Good Lighting</p>
                      <p className="text-sm text-muted-foreground">Take photos in natural daylight for best results</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Clear Focus</p>
                      <p className="text-sm text-muted-foreground">Ensure affected areas are clearly visible and in focus</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Multiple Angles</p>
                      <p className="text-sm text-muted-foreground">Take photos from different angles for better diagnosis</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;