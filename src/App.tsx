import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, NetworkStatus } from "@/components/ErrorHandling";
import Index from "./pages/Index";
import CropPlanner from "./pages/CropPlanner";
import CropCalendar from "./pages/CropCalendar";
import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import SoilData from "./pages/SoilData";
import DataExport from "./pages/DataExport";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <NetworkStatus />
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/crop-planner" element={<ProtectedRoute><CropPlanner /></ProtectedRoute>} />
          <Route path="/crop-calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
          <Route path="/soil-data" element={<ProtectedRoute><SoilData /></ProtectedRoute>} />
          <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/data-export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
