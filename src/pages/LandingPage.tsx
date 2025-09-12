import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Users, Star, ArrowRight, Shield, Zap, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/brand/Logo';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to the main app
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Palette,
      title: 'Design Studio',
      description: 'Create stunning designs with our intuitive design tools and templates.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with other designers and share your creative journey.'
    },
    {
      icon: Star,
      title: 'Marketplace',
      description: 'Discover and purchase unique designs from talented creators.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your designs and data are protected with enterprise-grade security.'
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Lightning-fast design tools that keep up with your creativity.'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Built by designers, for designers, with attention to every detail.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Designer',
      content: 'Manana has revolutionized my design workflow. The tools are intuitive and the community is amazing!',
      avatar: '👩‍🎨'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Creative Director',
      content: 'The best platform for collaborative design work. Our team productivity has increased significantly.',
      avatar: '👨‍💼'
    },
    {
      name: 'Emma Thompson',
      role: 'UI/UX Designer',
      content: 'I love the marketplace feature. It\'s a great way to monetize my designs and discover new inspiration.',
      avatar: '👩‍💻'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎨 New Design Tools Available
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Design. Create. Share.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Welcome to Manana - the ultimate platform for designers to create stunning visuals, 
            connect with like-minded creators, and showcase their work to the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to create</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools, vibrant community, and endless possibilities - all in one platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by creators worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about their experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to start your creative journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of designers who are already creating amazing things with Manana.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Logo />
              <p className="text-sm text-muted-foreground">
                © 2024 Manana. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}