import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarDays, Bell, Plus, Edit, Trash2, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CropCalendar = () => {
  const { user, loading, requireAuth } = useAuthProtection();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [crops, setCrops] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cultivationPlan, setCultivationPlan] = useState([]);
  const [showPlan, setShowPlan] = useState(true);
  const [newTask, setNewTask] = useState({
    crop_name: '',
    task_type: '',
    task_description: '',
    scheduled_date: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      requireAuth();
    }
  }, [user, loading, requireAuth]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCrops();
      fetchProfile();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchCrops = async () => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateCropPlan = async (crop) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-crop-plan', {
        body: {
          cropName: crop.name,
          variety: crop.variety,
          plantingDate: crop.planting_date,
          expectedHarvestDate: crop.expected_harvest_date,
          soilType: profile?.soil_type || 'unknown',
          location: profile?.location || 'India'
        }
      });

      if (error) throw error;

      if (data?.plan) {
        setCultivationPlan(data.plan);
        toast({
          title: "Plan Generated!",
          description: `Created ${data.plan.length} activities for ${crop.name}`,
        });
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addPlanToCalendar = async (activity, crop) => {
    if (!crop?.planting_date) return;

    const plantingDate = new Date(crop.planting_date);
    const scheduledDate = new Date(plantingDate);
    scheduledDate.setDate(scheduledDate.getDate() + activity.day_number - 1);

    try {
      const { error } = await supabase
        .from('farm_tasks')
        .insert({
          user_id: user.id,
          crop_name: crop.name,
          task_type: activity.activity,
          task_description: activity.description,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          priority: activity.day_number <= 30 ? 'high' : 'medium',
          notes: `Resources: ${activity.required_resources?.join(', ')}`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Task Added",
        description: `${activity.activity} scheduled for Day ${activity.day_number}`,
      });

      fetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!newTask.crop_name || !newTask.task_type || !newTask.scheduled_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('farm_tasks')
        .insert({
          user_id: user.id,
          crop_name: newTask.crop_name,
          task_type: newTask.task_type,
          task_description: newTask.task_description,
          scheduled_date: newTask.scheduled_date,
          priority: newTask.priority,
          notes: newTask.notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Task Added",
        description: "Your farming task has been scheduled.",
      });

      setNewTask({
        crop_name: '',
        task_type: '',
        task_description: '',
        scheduled_date: '',
        priority: 'medium',
        notes: ''
      });
      setShowAddTask(false);
      fetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTaskComplete = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('farm_tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: newStatus === 'completed' ? "Task Completed" : "Task Reopened",
        description: "Task status updated successfully.",
      });

      fetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('farm_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Deleted",
        description: "Task has been removed from your calendar.",
      });

      fetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const taskTypes = [
    'Planting', 'Watering', 'Fertilizing', 'Pruning', 'Harvesting', 
    'Pest Control', 'Soil Testing', 'Weeding', 'Monitoring', 'Other'
  ];

  const today = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks.filter(task => task.scheduled_date >= today && task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => task.scheduled_date < today && task.status !== 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Crop Calendar</h1>
                <p className="text-muted-foreground">Plan and track your farming activities</p>
              </div>
            </div>
            <Button onClick={() => setShowAddTask(!showAddTask)} variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Crop Selection & Plan Generation */}
        {crops.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                AI-Powered Cultivation Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a complete day-by-day cultivation plan for your crops using AI
                </p>
                <div className="flex flex-wrap gap-3">
                  {crops.map((crop) => (
                    <Button
                      key={crop.id}
                      onClick={() => generateCropPlan(crop)}
                      disabled={isGenerating}
                      variant="outline"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Plan for {crop.name}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Cultivation Plan */}
        {cultivationPlan.length > 0 && showPlan && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                  Day-by-Day Cultivation Plan ({cultivationPlan.length} activities)
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlan(false)}
                >
                  Hide Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {cultivationPlan.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Day {activity.day_number}</Badge>
                          <h4 className="font-semibold">{activity.activity}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        {activity.required_resources && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {activity.required_resources.map((resource, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {activity.estimated_duration && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {activity.estimated_duration}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addPlanToCalendar(activity, crops[0])}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Task Form */}
          {showAddTask && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="crop-name">Crop Name *</Label>
                      <Input
                        id="crop-name"
                        placeholder="e.g., Tomatoes, Wheat"
                        value={newTask.crop_name}
                        onChange={(e) => setNewTask(prev => ({ ...prev, crop_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-type">Task Type *</Label>
                      <Select 
                        value={newTask.task_type} 
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, task_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="task-description">Task Description</Label>
                    <Input
                      id="task-description"
                      placeholder="Describe the task..."
                      value={newTask.task_description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                      <Input
                        id="scheduled-date"
                        type="date"
                        min={today}
                        value={newTask.scheduled_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes or reminders..."
                      value={newTask.notes}
                      onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={addTask} variant="hero">
                      Add Task
                    </Button>
                    <Button onClick={() => setShowAddTask(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Bell className="w-5 h-5 mr-2" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-destructive">{task.crop_name}</h4>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.scheduled_date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTaskComplete(task.id, task.status)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Upcoming Tasks ({upcomingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.crop_name}</h4>
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.scheduled_date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTaskComplete(task.id, task.status)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming tasks. Add your first task to get started!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-success" />
                Completed Tasks ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {completedTasks.length > 0 ? (
                  completedTasks.map((task) => (
                    <div key={task.id} className="p-3 border border-success/20 bg-success/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-success">{task.crop_name}</h4>
                        <Badge variant="outline" className="text-success border-success">
                          Done
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Completed: {new Date(task.completed_at).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTaskComplete(task.id, task.status)}
                        >
                          Reopen
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No completed tasks yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;