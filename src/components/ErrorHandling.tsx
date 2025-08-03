import React from 'react';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mb-4">
                Something went wrong. Please try refreshing the page.
              </AlertDescription>
              <Button onClick={this.resetError} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton components
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="border rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-muted rounded w-5/6"></div>
  </div>
);

// Network status indicator
export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Some features may not work.</span>
      </div>
    </div>
  );
};