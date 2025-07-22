import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scan, 
  CloudRain, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  Smartphone,
  Brain,
  Globe
} from 'lucide-react';
import diseaseDetectionImage from '@/assets/disease-detection.jpg';
import weatherMonitoringImage from '@/assets/weather-monitoring.jpg';
import communityImage from '@/assets/community.jpg';

const Features = () => {
  const features = [
    {
      icon: Scan,
      title: "AI Disease Detection",
      description: "Upload photos of your crops and get instant diagnosis with treatment recommendations powered by advanced AI.",
      image: diseaseDetectionImage,
      color: "success",
      stats: "99.5% accuracy"
    },
    {
      icon: CloudRain,
      title: "Weather-Based Planning",
      description: "Real-time weather integration provides personalized irrigation, fertilization, and harvest timing advice.",
      image: weatherMonitoringImage,
      color: "sky",
      stats: "7-day forecasts"
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Connect with agricultural experts and fellow farmers for advice, tips, and collaborative problem-solving.",
      image: communityImage,
      color: "earth",
      stats: "50K+ farmers"
    }
  ];

  const additionalFeatures = [
    {
      icon: Calendar,
      title: "Seasonal Planning",
      description: "Comprehensive crop calendars with planting, care, and harvest schedules tailored to your region."
    },
    {
      icon: TrendingUp,
      title: "Yield Optimization",
      description: "Data-driven insights to maximize your crop yield and improve farming efficiency."
    },
    {
      icon: MessageCircle,
      title: "Multilingual Support",
      description: "Available in Tamil, Telugu, Hindi, and more regional languages with voice support."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for smartphones with offline capabilities for rural connectivity."
    },
    {
      icon: Brain,
      title: "Smart Recommendations",
      description: "Personalized advice based on your soil type, climate, and farming history."
    },
    {
      icon: Globe,
      title: "Regional Expertise",
      description: "Localized knowledge for Tamil Nadu, Karnataka, and other South Indian states."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Revolutionizing Agriculture with
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              AI Technology
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive tools designed to support farmers at every stage of the agricultural process.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-elegant transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-card-foreground">
                  {feature.stats}
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 bg-${feature.color}/20 rounded-xl flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Button variant="ghost" className="group p-0 h-auto font-medium">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-elegant transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/20"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;