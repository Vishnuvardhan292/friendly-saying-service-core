import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Smartphone, Brain, Globe } from 'lucide-react';
import heroImage from '@/assets/hero-farming.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background to-muted overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4" />
              <span>AI-Powered Agriculture</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Smart Farming
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                AI-powered daily crop guidance and seasonal planning to maximize your yield and optimize your farming operations.
              </p>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-success" />
                </div>
                <span className="text-foreground">Disease Detection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sky/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-sky" />
                </div>
                <span className="text-foreground">Weather Integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-accent" />
                </div>
                <span className="text-foreground">Multi-language</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-earth/20 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-earth" />
                </div>
                <span className="text-foreground">Expert Community</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Smart farming with AI technology" 
                className="w-full h-auto rounded-2xl shadow-elegant"
              />
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-card p-4 rounded-xl shadow-glow animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-card-foreground">Crop Health: Excellent</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-glow animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-sky rounded-full animate-pulse-slow"></div>
                  <span className="text-sm font-medium text-card-foreground">Weather: Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;