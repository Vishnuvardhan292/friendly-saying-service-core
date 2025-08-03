import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, BarChart3, Leaf } from 'lucide-react';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DataExport = () => {
  const { user, requireAuth } = useAuthProtection();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  // Check authentication
  if (!user) {
    requireAuth();
    return null;
  }

  const exportData = async (dataType: string) => {
    setExporting(true);
    
    try {
      let data: any[] = [];
      let filename = '';
      
      switch (dataType) {
        case 'crop-tracking':
          const { data: cropData } = await supabase
            .from('crop_growth_tracking')
            .select('*')
            .eq('user_id', user.id);
          data = cropData || [];
          filename = 'crop-tracking-data.csv';
          break;
          
        case 'soil-tests':
          const { data: soilData } = await supabase
            .from('soil_tests')
            .select('*')
            .eq('user_id', user.id);
          data = soilData || [];
          filename = 'soil-test-data.csv';
          break;
          
        case 'farm-tasks':
          const { data: taskData } = await supabase
            .from('farm_tasks')
            .select('*')
            .eq('user_id', user.id);
          data = taskData || [];
          filename = 'farm-tasks-data.csv';
          break;
          
        case 'disease-detections':
          const { data: diseaseData } = await supabase
            .from('disease_detections')
            .select('*')
            .eq('user_id', user.id);
          data = diseaseData || [];
          filename = 'disease-detection-data.csv';
          break;
      }

      if (data.length === 0) {
        toast({
          title: "No Data Found",
          description: `No ${dataType.replace('-', ' ')} data available for export.`,
          variant: "destructive",
        });
        return;
      }

      // Convert to CSV
      const csvContent = convertToCSV(data);
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Your ${dataType.replace('-', ' ')} data has been exported.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle commas and quotes in data
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const exportOptions = [
    {
      id: 'crop-tracking',
      title: 'Crop Tracking Data',
      description: 'Export all your crop growth tracking records',
      icon: Leaf,
      color: 'text-success'
    },
    {
      id: 'soil-tests',
      title: 'Soil Test Data',
      description: 'Export your soil analysis and test results',
      icon: BarChart3,
      color: 'text-earth'
    },
    {
      id: 'farm-tasks',
      title: 'Farm Tasks & Calendar',
      description: 'Export your scheduled and completed farming tasks',
      icon: Calendar,
      color: 'text-primary'
    },
    {
      id: 'disease-detections',
      title: 'Disease Detection Records',
      description: 'Export your crop disease detection history',
      icon: FileText,
      color: 'text-destructive'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Data Export</h1>
              <p className="text-muted-foreground">Export your farming data for analysis and backup</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {exportOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card key={option.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconComponent className={`w-5 h-5 mr-2 ${option.color}`} />
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">CSV Format</Badge>
                    <Button
                      onClick={() => exportData(option.id)}
                      disabled={exporting}
                      variant="outline"
                    >
                      {exporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Export Info */}
        <Card className="mt-8 max-w-4xl">
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• All exports are in CSV format, compatible with Excel, Google Sheets, and other data analysis tools</p>
              <p>• Data includes all records associated with your account</p>
              <p>• Sensitive information like user IDs are included for data integrity</p>
              <p>• Files are generated in real-time from your current database</p>
              <p>• No data is stored on our servers during the export process</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataExport;