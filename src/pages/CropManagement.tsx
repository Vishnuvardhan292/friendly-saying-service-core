import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, MapPin, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { toast } from 'sonner';
import Header from '@/components/Header';
import AddCropForm from '@/components/AddCropForm';

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

const CropManagement = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuthProtection();

  useEffect(() => {
    if (user) {
      fetchCrops();
    }
  }, [user]);

  const fetchCrops = async () => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrops(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch crops: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCrop = async (cropId: string) => {
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', cropId);

      if (error) throw error;
      
      setCrops(crops.filter(crop => crop.id !== cropId));
      toast.success('Crop deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete crop: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'harvested': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'planted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'growing': return 'bg-green-100 text-green-800 border-green-200';
      case 'mature': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'harvested': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading crops...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crop Management</h1>
            <p className="text-muted-foreground">Manage your crops and track their progress</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Crop
          </Button>
        </div>

        {showAddForm && (
          <AddCropForm 
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              fetchCrops();
            }}
          />
        )}

        {crops.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No crops yet</h2>
              <p className="text-muted-foreground mb-4">Start by adding your first crop to track its progress.</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Crop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <Card key={crop.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <CardDescription>{crop.variety}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(crop.status)}>
                      {crop.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <Badge variant="secondary">{crop.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Growth Stage:</span>
                      <Badge variant="outline" className={getGrowthStageColor(crop.growth_stage)}>
                        {crop.growth_stage}
                      </Badge>
                    </div>

                    {crop.field_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{crop.field_location}</span>
                      </div>
                    )}

                    {crop.area_planted && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Area:</span>
                        <span className="text-sm font-medium">{crop.area_planted} acres</span>
                      </div>
                    )}

                    {crop.planting_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Planted: {new Date(crop.planting_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {crop.expected_harvest_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {crop.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {crop.notes}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteCrop(crop.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropManagement;