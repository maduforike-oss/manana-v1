import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Palette, ShoppingCart, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target?: string;
  action?: () => void;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Manana',
    description: 'Your creative platform for designing and selling custom apparel. Let\'s get you started!',
    icon: Sparkles,
  },
  {
    id: 'studio',
    title: 'Design Studio',
    description: 'Create amazing designs with our powerful tools. Add text, shapes, images, and more.',
    icon: Palette,
    target: '[data-tab="studio"]',
    action: () => {
      const { setActiveTab } = useAppStore.getState();
      setActiveTab('studio');
    }
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Discover thousands of designs from creators worldwide or sell your own creations.',
    icon: ShoppingCart,
    target: '[data-tab="market"]',
    action: () => {
      const { setActiveTab } = useAppStore.getState();
      setActiveTab('market');
    }
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with other creators, share your work, and get inspired by the community.',
    icon: Users,
    target: '[data-tab="community"]',
    action: () => {
      const { setActiveTab } = useAppStore.getState();
      setActiveTab('community');
    }
  },
];

export const OnboardingWalkthrough = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  useEffect(() => {
    // Check if user has seen walkthrough
    const hasSeenWalkthrough = localStorage.getItem('manana-walkthrough-completed');
    if (!hasSeenWalkthrough) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    // Highlight target element
    const step = walkthroughSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.classList.add('walkthrough-highlight');
        
        return () => {
          element.classList.remove('walkthrough-highlight');
        };
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep]);

  const nextStep = () => {
    const step = walkthroughSteps[currentStep];
    
    // Execute step action if any
    if (step.action) {
      step.action();
    }

    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeWalkthrough();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeWalkthrough = () => {
    localStorage.setItem('manana-walkthrough-completed', 'true');
    setIsVisible(false);
    
    // Clean up any highlights
    if (highlightedElement) {
      highlightedElement.classList.remove('walkthrough-highlight');
    }
  };

  const skipWalkthrough = () => {
    localStorage.setItem('manana-walkthrough-completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentWalkthroughStep = walkthroughSteps[currentStep];
  const Icon = currentWalkthroughStep.icon;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      
      {/* Walkthrough Card */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background/95 backdrop-blur-lg border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {walkthroughSteps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipWalkthrough}
                  className="text-xs h-6 px-2"
                >
                  Skip
                </Button>
              </div>
              
              <CardTitle className="text-xl">{currentWalkthroughStep.title}</CardTitle>
              <CardDescription className="text-base">
                {currentWalkthroughStep.description}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex space-x-2">
              {walkthroughSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full flex-1 transition-colors duration-300",
                    index <= currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                {currentStep === walkthroughSteps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlight Styles */}
      <style>{`
        .walkthrough-highlight {
          position: relative;
          z-index: 99;
          border-radius: 12px;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5), 0 0 0 8px hsl(var(--primary) / 0.2);
          animation: walkthrough-pulse 2s ease-in-out infinite;
        }
        
        @keyframes walkthrough-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5), 0 0 0 8px hsl(var(--primary) / 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px hsl(var(--primary) / 0.3), 0 0 0 16px hsl(var(--primary) / 0.1);
          }
        }
      `}</style>
    </>
  );
};