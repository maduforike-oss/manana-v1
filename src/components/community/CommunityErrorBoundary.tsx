import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CommunityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Community Error Boundary caught an error:', error, errorInfo);
    toast.error('Something went wrong in the community feed');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex justify-center items-center min-h-[400px] p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Oops! Something went wrong
              </h3>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We encountered an error while loading the community feed. Please try again.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <summary className="cursor-pointer mb-2 font-medium">Error Details</summary>
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <Button 
                onClick={this.handleRetry}
                className="w-full gap-2"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}