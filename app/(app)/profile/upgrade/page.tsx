"use client"

import { ArrowLeft, Check, Crown, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function UpgradePlanPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Basic",
      price: "£10.99",
      period: "/month",
      description: "Perfect for getting started",
      current: true,
      features: [
        "30 designs per month",
        "All garment types",
        "Studio tools access",
        "Community features",
        "Basic support",
      ],
      limitations: [
        "Limited design templates",
        "Standard export quality",
      ]
    },
    {
      name: "Premium",
      price: "£24.99",
      period: "/month",
      description: "For serious designers",
      popular: true,
      features: [
        "Unlimited designs",
        "Premium templates",
        "High-resolution exports",
        "Priority support",
        "Advanced studio tools",
        "Commercial license",
        "Analytics dashboard",
      ],
      limitations: []
    },
    {
      name: "Pro",
      price: "£49.99",
      period: "/month",
      description: "For design professionals",
      features: [
        "Everything in Premium",
        "White-label options",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Team collaboration",
        "Advanced analytics",
        "Custom branding",
      ],
      limitations: []
    }
  ];

  const handleUpgrade = (planName: string) => {
    console.log(`Upgrade to ${planName}`);
    // TODO: Integrate with payment system
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upgrade Your Plan</h1>
          <p className="text-muted-foreground">Unlock more features and take your designs to the next level</p>
        </div>
      </div>

      {/* Current Usage */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Current Usage</h3>
              <p className="text-sm text-muted-foreground">Basic Plan - £10.99/month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">12/30</p>
              <p className="text-sm text-muted-foreground">Designs this month</p>
            </div>
          </div>
          <div className="mt-4 bg-background rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly limit</span>
              <span>40% used</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${plan.current ? 'border-secondary' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                {plan.name === 'Premium' && <Crown className="w-6 h-6 text-primary mr-2" />}
                {plan.name === 'Pro' && <Zap className="w-6 h-6 text-primary mr-2" />}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Limitations:</p>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className="w-full mt-6"
                variant={plan.current ? "outline" : (plan.popular ? "default" : "outline")}
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens to my designs if I downgrade?</h4>
            <p className="text-sm text-muted-foreground">All your existing designs will remain accessible, but you'll be limited by your new plan's features for future designs.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">We offer a 7-day money-back guarantee for all new subscriptions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}