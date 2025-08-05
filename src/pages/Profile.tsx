import React, { useState, useEffect } from 'react';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, MapPin, Ruler, Mountain } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  farm_size: number | null;
  soil_type: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuthProtection();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    farm_size: null,
    soil_type: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      setProfile({
        full_name: data.full_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        location: data.location || '',
        farm_size: data.farm_size,
        soil_type: data.soil_type || ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          farm_size: profile.farm_size,
          soil_type: profile.soil_type
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pt-20">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-primary" />
              Profile Settings
            </CardTitle>
            <p className="text-muted-foreground">
              Manage your account information and farming preferences
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email (Read Only)
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm_size" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Farm Size (acres)
              </Label>
              <Input
                id="farm_size"
                type="number"
                value={profile.farm_size || ''}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  farm_size: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="Enter farm size in acres"
                min="0"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soil_type" className="flex items-center gap-2">
                <Mountain className="w-4 h-4" />
                Soil Type
              </Label>
              <Select
                value={profile.soil_type}
                onValueChange={(value) => setProfile(prev => ({ ...prev, soil_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="silt">Silt</SelectItem>
                  <SelectItem value="chalky">Chalky</SelectItem>
                  <SelectItem value="peaty">Peaty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;