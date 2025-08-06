import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { toast } from 'sonner';

interface AddCropFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddCropForm: React.FC<AddCropFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthProtection();
  
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    category: '',
    planting_date: '',
    expected_harvest_date: '',
    growth_stage: 'planning',
    field_location: '',
    area_planted: '',
    notes: '',
    status: 'active'
  });

  const categories = [
    'vegetables',
    'fruits',
    'grains',
    'legumes',
    'herbs',
    'tubers',
    'cereals',
    'oilseeds'
  ];

  const growthStages = [
    'planning',
    'planted',
    'growing',
    'mature',
    'harvested'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const cropData = {
        ...formData,
        user_id: user.id,
        area_planted: formData.area_planted ? parseFloat(formData.area_planted) : null,
        planting_date: formData.planting_date || null,
        expected_harvest_date: formData.expected_harvest_date || null
      };

      const { error } = await supabase
        .from('crops')
        .insert([cropData]);

      if (error) throw error;

      toast.success('Crop added successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to add crop: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Crop</CardTitle>
              <CardDescription>Fill in the details for your new crop</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Crop Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Tomato, Wheat, Rice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  value={formData.variety}
                  onChange={(e) => handleChange('variety', e.target.value)}
                  placeholder="e.g., Cherry, Winter Wheat"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="growth_stage">Growth Stage</Label>
                <Select value={formData.growth_stage} onValueChange={(value) => handleChange('growth_stage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {growthStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planting_date">Planting Date</Label>
                <Input
                  id="planting_date"
                  type="date"
                  value={formData.planting_date}
                  onChange={(e) => handleChange('planting_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_harvest_date">Expected Harvest Date</Label>
                <Input
                  id="expected_harvest_date"
                  type="date"
                  value={formData.expected_harvest_date}
                  onChange={(e) => handleChange('expected_harvest_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field_location">Field Location</Label>
                <Input
                  id="field_location"
                  value={formData.field_location}
                  onChange={(e) => handleChange('field_location', e.target.value)}
                  placeholder="e.g., North Field, Greenhouse 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_planted">Area Planted (acres)</Label>
                <Input
                  id="area_planted"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.area_planted}
                  onChange={(e) => handleChange('area_planted', e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes about this crop..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name || !formData.category} className="flex-1">
                {loading ? 'Adding...' : 'Add Crop'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCropForm;