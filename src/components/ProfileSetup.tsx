import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, MapPin, Tractor, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  user: any;
  onComplete: () => void;
}

const ProfileSetup = ({ user, onComplete }: ProfileSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    farmSize: user?.user_metadata?.farm_size || '',
    soilType: user?.user_metadata?.soil_type || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Insert or update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          farm_size: parseFloat(profileData.farmSize) || null,
          soil_type: profileData.soilType
        });

      if (error) throw error;

      toast({
        title: "Profile Updated!",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Profile Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const soilTypes = [
    'Clay', 'Sandy', 'Loam', 'Silt', 'Peat', 'Chalk', 'Red Soil', 'Black Soil', 'Alluvial', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">Help us personalize your farming experience</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profile Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Farm Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State, Country"
                    className="pl-10"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (acres)</Label>
                  <div className="relative">
                    <Tractor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="farmSize"
                      type="number"
                      placeholder="5.0"
                      className="pl-10"
                      value={profileData.farmSize}
                      onChange={(e) => setProfileData(prev => ({ ...prev, farmSize: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilType">Primary Soil Type</Label>
                  <Select 
                    value={profileData.soilType} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, soilType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map(soil => (
                        <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onComplete}
                >
                  Skip for Now
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  variant="hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;