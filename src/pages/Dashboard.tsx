import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cropTracking, setCropTracking] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchCropTracking();
    generateTodayTasks();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCropTracking = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('crop_growth_tracking')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_updated', { ascending: false });
        
        setCropTracking(data || []);
      }
    } catch (error) {
      console.error('Error fetching crop tracking:', error);
    }
  };

  const generateTodayTasks = () => {
    const tasks = [
      { id: 1, task: 'Check soil moisture levels', priority: 'High', completed: false },
      { id: 2, task: 'Monitor for pest activity', priority: 'Medium', completed: true },
      { id: 3, task: 'Apply organic fertilizer to tomato plots', priority: 'High', completed: false },
      { id: 4, task: 'Prune excess branches', priority: 'Low', completed: false },
      { id: 5, task: 'Record growth measurements', priority: 'Medium', completed: false },
    ];
    setTodayTasks(tasks);
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

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / todayTasks.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name || 'Farmer'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's your farming dashboard for today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-success">
                <Leaf className="w-4 h-4 mr-1" />
                {cropTracking.length} Active Crops
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">Today's Tasks</p>
                      <p className="text-2xl font-bold">{completedTasks}/{todayTasks.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-sky text-sky-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-foreground/80 text-sm">Weather</p>
                      <p className="text-2xl font-bold">28°C</p>
                    </div>
                    <CloudRain className="w-8 h-8 text-sky-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-earth text-earth-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-earth-foreground/80 text-sm">Soil Health</p>
                      <p className="text-2xl font-bold">Excellent</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-earth-foreground/80" />
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
                <div className="space-y-4">
                  {todayTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border ${
                        task.completed ? 'bg-success/5 border-success/20' : 'bg-card'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
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
              </CardContent>
            </Card>

            {/* Active Crops */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-success" />
                  Active Crops
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cropTracking.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cropTracking.slice(0, 4).map((crop) => (
                      <div key={crop.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{crop.crop_name}</h4>
                          <Badge variant={crop.health_status === 'Healthy' ? 'default' : 'destructive'}>
                            {crop.health_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Stage: {crop.current_growth_stage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Planted: {new Date(crop.planting_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active crops. Start your first crop plan!</p>
                    <Button className="mt-4" variant="outline">
                      Add New Crop
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
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
                    <span className="font-semibold">28°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CloudRain className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Rain Chance</span>
                    </div>
                    <span className="font-semibold">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Disease Detection
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Leaf className="w-4 h-4 mr-2" />
                    Crop Planner
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Growth Tracker
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Expert Community
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Pest Alert</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aphids detected in tomato field. Check immediately.
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm font-medium text-accent">Weather Warning</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Heavy rain expected tomorrow. Prepare drainage.
                    </p>
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