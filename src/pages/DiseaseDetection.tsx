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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<{ id: number; url: string; name: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [cropType, setCropType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check authentication
  if (!user) {
    requireAuth();
    return null;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Limit to 5 images
      const limitedFiles = files.slice(0, 5);
      
      if (files.length > 5) {
        toast({
          title: "Too Many Images",
          description: "Maximum 5 images allowed. First 5 images selected.",
          variant: "destructive",
        });
      }

      setSelectedImages(limitedFiles);
      
      // Generate previews for all images
      const previews: Array<{ id: number; url: string; name: string }> = [];
      limitedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push({ id: index, url: e.target.result as string, name: file.name });
            if (previews.length === limitedFiles.length) {
              setImagePreviews(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const analyzeImage = async () => {
    if (selectedImages.length === 0 || !cropType) {
      toast({
        title: "Missing Information",
        description: "Please upload at least one image and specify the crop type.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      // Upload all images to Supabase Storage
      const uploadPromises = selectedImages.map(async (image, index) => {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('crop-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('crop-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      setUploadProgress(40);

      // Call AI analysis edge function with multiple images
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-disease', {
          body: {
            imageUrls: imageUrls,
            cropType: cropType
          }
        });

      if (analysisError) throw analysisError;

      setUploadProgress(75);

      const aiResults = {
        disease: analysisData.detectedDisease || "Unknown",
        confidence: analysisData.confidenceScore || 0,
        severity: analysisData.confidenceScore > 80 ? "High" : 
                 analysisData.confidenceScore > 60 ? "Moderate" : "Low",
        description: analysisData.symptoms || "Analysis completed",
        symptoms: analysisData.symptoms ? analysisData.symptoms.split('. ').filter(s => s.length > 0) : ["No symptoms detected"],
        causes: ["Based on AI analysis"],
        treatment: analysisData.treatmentRecommendation ? 
                  analysisData.treatmentRecommendation.split('. ').filter(t => t.length > 0) : 
                  ["Consult with agricultural expert"],
        prevention: analysisData.preventionMethods ? 
                   analysisData.preventionMethods.split('. ').filter(p => p.length > 0) : 
                   ["Follow standard prevention practices"]
      };

      setUploadProgress(100);

      // Save to database (use first image URL as primary)
      const { error: dbError } = await supabase
        .from('disease_detections')
        .insert({
          user_id: user.id,
          image_url: imageUrls[0],
          crop_type: cropType,
          detected_disease: aiResults.disease,
          confidence_score: aiResults.confidence,
          symptoms: aiResults.symptoms.join('; '),
          treatment_recommendation: aiResults.treatment.join('; ')
        });

      if (dbError) throw dbError;

      setAnalysisResult(aiResults);
      
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
                  <Label>Crop Images (up to 5)</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={preview.id} className="relative group">
                              <img 
                                src={preview.url} 
                                alt={`Crop ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
                                {index + 1}/{imagePreviews.length}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" type="button">
                          <Upload className="w-4 h-4 mr-2" />
                          {imagePreviews.length < 5 ? 'Add More Images' : 'Change Images'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Click to upload images</p>
                          <p className="text-sm text-muted-foreground">Upload 1-5 images from different angles</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB each</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <Button 
                  onClick={analyzeImage}
                  disabled={selectedImages.length === 0 || !cropType || isAnalyzing}
                  className="w-full"
                  variant="hero"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze {selectedImages.length > 0 ? `${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}` : 'Images'}
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