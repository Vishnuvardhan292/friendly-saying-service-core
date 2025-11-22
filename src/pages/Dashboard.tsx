import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, 
  CloudRain, 
  Calendar, 
  Camera, 
  Settings, 
  TrendingUp,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Users,
  LogOut,
  MapPin,
  BarChart3,
  Clock,
  Plus,
  Lightbulb,
  Target,
  ArrowRight,
  Beaker
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import ProfileSetup from '@/components/ProfileSetup';
import Header from '@/components/Header';

import { useWeather } from '@/hooks/useWeather';
import WeatherWidget from '@/components/WeatherWidget';
import SoilMoisture from '@/components/SoilMoisture';

interface Crop {
  id: string;
  name: string;
  variety: string;
  category: string;
  planting_date: string;
  expected_harvest_date: string;
  growth_stage: string;
  field_location: string;
  area_planted: number;
  notes: string;
  status: string;
  created_at: string;
}

interface SoilData {
  id: number;
  ph_level: number;
  organic_matter_percentage: number;
  nitrogen_level: number;
  phosphorus_level: number;
  potassium_level: number;
  soil_type: string;
  location: string;
  test_date: string;
}

interface CropRecommendation {
  name: string;
  suitability_score: number;
  reasons: string[];
  planting_season: string;
  cultivation_plan: {
    week: number;
    activity: string;
    description: string;
  }[];
}

const Dashboard = () => {
  const { user, loading, requireAuth, signOut } = useAuthProtection();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get weather data based on user location
  const userLocation = profile?.location || 'New Delhi, India';
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(userLocation);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchCrops();
      fetchLatestSoilData();
      generateTodayTasks();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        setShowProfileSetup(true);
      } else if (!profileData || !profileData.full_name) {
        setShowProfileSetup(true);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      // Error logged, profile setup will be shown
    }
  };

  const fetchCrops = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setCrops(data || []);
    } catch (error) {
      // Error logged, empty array will be shown
    }
  };

  const fetchLatestSoilData = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('soil_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setSoilData(data[0]);
        analyzeSoilAndRecommendCrops(data[0]);
      }
    } catch (error) {
      // Error logged, no soil data will be shown
    }
  };

  const analyzeSoilAndRecommendCrops = (soil: SoilData) => {
    const recommendations: CropRecommendation[] = [];
    
    // Rice - suitable for pH 5.5-6.5, high water retention
    if (soil.ph_level >= 5.5 && soil.ph_level <= 6.5 && soil.soil_type.toLowerCase().includes('clay')) {
      recommendations.push({
        name: 'Rice',
        suitability_score: 85,
        reasons: [
          `pH ${soil.ph_level} is ideal for rice cultivation`,
          `${soil.soil_type} soil provides good water retention`,
          `Nitrogen level ${soil.nitrogen_level} supports leafy growth`
        ],
        planting_season: 'Kharif (June-July)',
        cultivation_plan: [
          { week: 1, activity: 'Land Preparation', description: 'Plow and level the field, prepare seedbed' },
          { week: 2, activity: 'Seedling Preparation', description: 'Prepare nursery and sow seeds' },
          { week: 4, activity: 'Transplanting', description: 'Transplant 25-30 day old seedlings' },
          { week: 8, activity: 'First Fertilizer', description: 'Apply nitrogen-rich fertilizer' },
          { week: 12, activity: 'Panicle Initiation', description: 'Monitor for flowering stage' },
          { week: 16, activity: 'Harvest', description: 'Harvest when grains are golden yellow' }
        ]
      });
    }

    // Wheat - suitable for pH 6.0-7.5, moderate nitrogen
    if (soil.ph_level >= 6.0 && soil.ph_level <= 7.5 && soil.nitrogen_level >= 40) {
      recommendations.push({
        name: 'Wheat',
        suitability_score: 90,
        reasons: [
          `pH ${soil.ph_level} is perfect for wheat`,
          `Nitrogen level ${soil.nitrogen_level} supports grain development`,
          `Phosphorus ${soil.phosphorus_level} aids root development`
        ],
        planting_season: 'Rabi (November-December)',
        cultivation_plan: [
          { week: 1, activity: 'Land Preparation', description: 'Deep plowing and soil preparation' },
          { week: 2, activity: 'Sowing', description: 'Sow seeds with proper spacing' },
          { week: 4, activity: 'First Irrigation', description: 'Crown root irrigation' },
          { week: 8, activity: 'Fertilizer Application', description: 'Apply NPK fertilizer' },
          { week: 12, activity: 'Flowering Stage', description: 'Monitor for ear emergence' },
          { week: 18, activity: 'Harvest', description: 'Harvest when grains are fully mature' }
        ]
      });
    }

    // Tomato - suitable for pH 6.0-6.8, well-drained soil
    if (soil.ph_level >= 6.0 && soil.ph_level <= 6.8 && soil.organic_matter_percentage >= 2) {
      recommendations.push({
        name: 'Tomato',
        suitability_score: 88,
        reasons: [
          `pH ${soil.ph_level} is ideal for tomato cultivation`,
          `Organic matter ${soil.organic_matter_percentage}% provides good nutrition`,
          `Potassium level ${soil.potassium_level} supports fruit development`
        ],
        planting_season: 'Year-round with protection',
        cultivation_plan: [
          { week: 1, activity: 'Seed Sowing', description: 'Sow seeds in nursery beds' },
          { week: 4, activity: 'Transplanting', description: 'Transplant seedlings to main field' },
          { week: 6, activity: 'Staking', description: 'Provide support stakes for plants' },
          { week: 8, activity: 'First Fertilizer', description: 'Apply balanced NPK fertilizer' },
          { week: 10, activity: 'Flowering', description: 'Monitor for first flower clusters' },
          { week: 14, activity: 'Harvest', description: 'Start harvesting mature fruits' }
        ]
      });
    }

    // Sort by suitability score and take top 3
    const topRecommendations = recommendations
      .sort((a, b) => b.suitability_score - a.suitability_score)
      .slice(0, 3);
    
    setCropRecommendations(topRecommendations);
  };

  const generateTodayTasks = () => {
    const baseTasks = [
      { id: 1, task: 'Check soil moisture levels', priority: 'High', completed: false },
      { id: 2, task: 'Monitor for pest activity', priority: 'Medium', completed: true },
      { id: 3, task: 'Record growth measurements', priority: 'Medium', completed: false },
    ];

    // Generate crop-specific tasks
    const cropTasks = crops.slice(0, 3).map((crop, index) => ({
      id: baseTasks.length + index + 1,
      task: `Water ${crop.name} in ${crop.field_location || 'field'}`,
      priority: 'High',
      completed: false,
      cropId: crop.id
    }));

    setTodayTasks([...baseTasks, ...cropTasks]);
  };

  const toggleTask = (taskId) => {
    setTodayTasks(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    toast({
      title: "Task Updated",
      description: "Task status has been updated successfully.",
    });
  };

  // Generate tasks when crops change
  useEffect(() => {
    if (crops.length > 0) {
      generateTodayTasks();
    }
  }, [crops]);

  // Calculate crop statistics
  const cropStats = {
    total: crops.length,
    active: crops.filter(crop => crop.status === 'active').length,
    harvested: crops.filter(crop => crop.status === 'harvested').length,
    growing: crops.filter(crop => crop.growth_stage === 'growing').length,
    mature: crops.filter(crop => crop.growth_stage === 'mature').length,
    categories: [...new Set(crops.map(crop => crop.category))].length,
    totalArea: crops.reduce((sum, crop) => sum + (crop.area_planted || 0), 0)
  };

  // Get crops that need harvest soon (within 30 days)
  const upcomingHarvests = crops.filter(crop => {
    if (!crop.expected_harvest_date) return false;
    const harvestDate = new Date(crop.expected_harvest_date);
    const now = new Date();
    const daysUntilHarvest = Math.ceil((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilHarvest <= 30 && daysUntilHarvest > 0;
  });

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const progressPercentage = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    requireAuth();
    return null;
  }

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        user={user} 
        onComplete={() => {
          setShowProfileSetup(false);
          fetchUserData();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {profile?.full_name || 'Farmer'}!
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.overview')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">Total Crops</p>
                      <p className="text-2xl font-bold">{cropStats.total}</p>
                    </div>
                    <Leaf className="w-8 h-8 text-primary-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Active</p>
                      <p className="text-2xl font-bold">{cropStats.active}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Farm Size</p>
                      <p className="text-2xl font-bold">{cropStats.totalArea.toFixed(1)}</p>
                      <p className="text-white/70 text-xs">acres</p>
                    </div>
                    <MapPin className="w-8 h-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Categories</p>
                      <p className="text-2xl font-bold">{cropStats.categories}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-success" />
                    Today's Tasks
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {completedTasks}/{todayTasks.length} completed
                  </div>
                </div>
                <Progress value={progressPercentage} className="mt-2" />
              </CardHeader>
              <CardContent>
                {todayTasks.length > 0 ? (
                  <div className="space-y-4">
                    {todayTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                          task.completed ? 'bg-success/5 border-success/20' : 'bg-card hover:bg-muted/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed 
                              ? 'bg-success border-success text-success-foreground' 
                              : 'border-muted-foreground hover:border-primary'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.task}
                          </p>
                        </div>
                        <Badge 
                          variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks for today</p>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Soil-Based Crop Recommendations */}
            {soilData && cropRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Beaker className="w-5 h-5 mr-2 text-blue-600" />
                      Soil-Based Crop Recommendations
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Based on latest soil test
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommendations based on pH {soilData.ph_level}, {soilData.soil_type} soil from {soilData.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {cropRecommendations.map((rec, index) => (
                      <div key={rec.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground flex items-center">
                            <Target className="w-4 h-4 mr-2 text-green-600" />
                            {rec.name}
                          </h4>
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              {rec.suitability_score}% match
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Season:</strong> {rec.planting_season}
                        </p>
                        
                        <div className="space-y-1 mb-4">
                          <p className="text-sm font-medium text-foreground">Why it's suitable:</p>
                          {rec.reasons.slice(0, 2).map((reason, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground flex items-start">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-500 flex-shrink-0 mt-0.5" />
                              {reason}
                            </p>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            navigate('/crop-planner', { 
                              state: { 
                                recommendedCrop: rec.name,
                                cultivationPlan: rec.cultivation_plan,
                                soilData: soilData
                              } 
                            });
                          }}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          View Crop Plan
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Beaker className="w-4 h-4 mr-2" />
                      Last soil test: {new Date(soilData.test_date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/soil-data')}
                      >
                        View Soil Data
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate('/crop-management')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Add to My Crops
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Soil Data Message */}
            {!soilData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Beaker className="w-5 h-5 mr-2 text-blue-600" />
                    Get Personalized Crop Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Beaker className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No soil test data found. Add your soil analysis to get personalized crop recommendations.
                    </p>
                    <Button 
                      onClick={() => navigate('/soil-data')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Soil Test Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-success" />
                    Your Crops
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/crop-management')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Crop
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {crops.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {crops.slice(0, 4).map((crop) => (
                      <div key={crop.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{crop.name}</h4>
                          <Badge variant={crop.status === 'active' ? 'default' : crop.status === 'harvested' ? 'secondary' : 'destructive'}>
                            {crop.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {crop.variety} • {crop.category}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Stage: {crop.growth_stage}
                        </p>
                        {crop.field_location && (
                          <p className="text-sm text-muted-foreground mb-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {crop.field_location}
                          </p>
                        )}
                        {crop.planting_date && (
                          <p className="text-sm text-muted-foreground">
                            Planted: {new Date(crop.planting_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No crops yet. Start your farming journey!</p>
                    <Button 
                      onClick={() => navigate('/crop-management')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Crop
                    </Button>
                  </div>
                )}
                {crops.length > 4 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/crop-management')}
                    >
                      View All Crops ({crops.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <WeatherWidget 
              weather={weather} 
              loading={weatherLoading} 
              error={weatherError} 
            />

            {/* Soil Moisture Monitor */}
            <SoilMoisture 
              fieldLocation={profile?.location || 'Main Field'}
              onReadingUpdate={(reading) => {
                console.log('Moisture reading:', reading);
              }}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/disease-detection')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {t('dashboard.checkDisease')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/crop-management')}
                  >
                    <Leaf className="w-4 h-4 mr-2" />
                    {t('header.cropManagement')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/crop-calendar')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('dashboard.viewCalendar')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/soil-data')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t('header.soilData')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    {t('features.community')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Harvests */}
            {upcomingHarvests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Harvests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingHarvests.slice(0, 3).map((crop) => {
                      const harvestDate = new Date(crop.expected_harvest_date);
                      const daysUntil = Math.ceil((harvestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={crop.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-800">{crop.name}</p>
                              <p className="text-sm text-orange-600">
                                {daysUntil} days until harvest
                              </p>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              {harvestDate.toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Farm Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Farm Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{cropStats.growing}</p>
                    <p className="text-sm text-muted-foreground">Growing</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{cropStats.mature}</p>
                    <p className="text-sm text-muted-foreground">Mature</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{cropStats.harvested}</p>
                    <p className="text-sm text-muted-foreground">Harvested</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{cropStats.totalArea.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Total Acres</p>
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

export default Dashboard;