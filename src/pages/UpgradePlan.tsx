import { useState } from 'react';
import { ArrowLeft, Check, Crown, Star, Zap, X, CreditCard, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';

export const UpgradePlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setActiveTab } = useAppStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Ensure profile tab is active
  useEffect(() => {
    setActiveTab('profile');
  }, [setActiveTab]);

  const plans = [
    {
      name: "Basic",
      monthlyPrice: "£10.99",
      yearlyPrice: "£109.99",
      description: "Perfect for getting started",
      current: true,
      features: [
        "30 designs per month",
        "All garment types",
        "Studio tools access",
        "Community features",
        "Basic support",
        "Standard templates",
        "720p exports"
      ],
      limitations: [
        "Limited design templates",
        "Standard export quality",
        "No commercial license",
        "Basic analytics"
      ]
    },
    {
      name: "Premium",
      monthlyPrice: "£24.99",
      yearlyPrice: "£249.99",
      description: "For serious designers",
      popular: true,
      savings: "Save £50/year",
      features: [
        "Unlimited designs",
        "Premium templates library",
        "4K high-resolution exports",
        "Priority support",
        "Advanced studio tools",
        "Commercial license included",
        "Analytics dashboard",
        "Custom fonts upload",
        "Batch export functionality",
        "Design versioning"
      ],
      limitations: []
    },
    {
      name: "Pro",
      monthlyPrice: "£49.99",
      yearlyPrice: "£499.99",
      description: "For design professionals",
      savings: "Save £100/year",
      features: [
        "Everything in Premium",
        "White-label options",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Team collaboration (up to 10 users)",
        "Advanced analytics & insights",
        "Custom branding removal",
        "Priority feature requests",
        "Advanced mockup generator",
        "Custom color palettes",
        "Design approval workflows"
      ],
      limitations: []
    }
  ];

  const handleUpgrade = (planName: string) => {
    if (planName === 'Basic') return;
    
    toast({ 
      title: "Upgrade Initiated", 
      description: `Redirecting to checkout for ${planName} plan...`,
    });
    
    // Simulate payment flow
    setTimeout(() => {
      toast({ 
        title: "Payment Required", 
        description: "This would redirect to Stripe checkout in a real app",
      });
    }, 1500);
  };

  const currentUsage = {
    designsUsed: 12,
    designsLimit: 30,
    storageUsed: 2.1,
    storageLimit: 5
  };

  const usagePercentage = (currentUsage.designsUsed / currentUsage.designsLimit) * 100;
  const storagePercentage = (currentUsage.storageUsed / currentUsage.storageLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Upgrade Your Plan
            </h1>
            <p className="text-muted-foreground">Unlock more features and take your designs to the next level</p>
          </div>
        </div>

        {/* Current Usage Stats */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Basic
                  </Badge>
                </div>
                <p className="text-2xl font-bold">£10.99<span className="text-sm text-muted-foreground font-normal">/month</span></p>
                <p className="text-sm text-muted-foreground">Renews on Feb 15, 2025</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Designs This Month</h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{currentUsage.designsUsed}/{currentUsage.designsLimit}</span>
                  <span>{Math.round(usagePercentage)}% used</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all" 
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentUsage.designsLimit - currentUsage.designsUsed} designs remaining
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Storage Used</h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{currentUsage.storageUsed}GB/{currentUsage.storageLimit}GB</span>
                  <span>{Math.round(storagePercentage)}% used</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all" 
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(currentUsage.storageLimit - currentUsage.storageUsed).toFixed(1)}GB remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label htmlFor="billing-toggle" className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="billing-toggle" className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              Save up to 17%
            </Badge>
          </Label>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                  : plan.current 
                  ? 'border-secondary bg-gradient-to-b from-secondary/5 to-transparent' 
                  : 'hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="px-4 py-1 bg-gradient-to-r from-secondary to-secondary/80 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === 'Premium' && <Crown className="w-6 h-6 text-primary mr-2" />}
                  {plan.name === 'Pro' && <Zap className="w-6 h-6 text-primary mr-2" />}
                  {plan.name === 'Basic' && <Sparkles className="w-6 h-6 text-primary mr-2" />}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">
                      {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && plan.savings && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Features Included:
                  </h4>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                      <X className="w-4 h-4" />
                      Limitations:
                    </h4>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl' 
                      : plan.current 
                      ? '' 
                      : 'bg-gradient-to-r from-primary/90 to-secondary/90 text-white'
                  }`}
                  variant={plan.current ? "outline" : "default"}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current}
                >
                  {plan.current ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security & FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>PCI DSS compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>7-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1 text-sm">Can I cancel anytime?</h4>
                <p className="text-xs text-muted-foreground">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">What happens to my designs if I downgrade?</h4>
                <p className="text-xs text-muted-foreground">All your existing designs will remain accessible, but you'll be limited by your new plan's features for future designs.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Do you offer refunds?</h4>
                <p className="text-xs text-muted-foreground">We offer a 7-day money-back guarantee for all new subscriptions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};