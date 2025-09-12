import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shirt, Palette, Users, Star, Zap, Shield, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              ✨ Create. Design. Sell.
            </Badge>
            <h1 className="text-4xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Design Custom Apparel
              <br />
              That Speaks Your Style
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into stunning custom apparel with our intuitive design studio. 
              Create, customize, and bring your vision to life.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate(user ? '/studio' : '/auth')}
            >
              <Shirt className="mr-2 h-5 w-5" />
              Start Designing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!user && (
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            )}
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Users className="mr-2 h-5 w-5" />
              Browse Community
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools, premium materials, and seamless workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Advanced Design Studio</CardTitle>
              <CardDescription>
                Professional tools with layers, effects, and unlimited creativity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-powered design assistance</li>
                <li>• Custom templates & graphics</li>
                <li>• Real-time preview</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center mb-4">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Premium Materials</CardTitle>
              <CardDescription>
                High-quality fabrics and printing for lasting designs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 100% organic cotton options</li>
                <li>• DTG & screen printing</li>
                <li>• Eco-friendly inks</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Fast Production</CardTitle>
              <CardDescription>
                From design to delivery in record time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 2-3 day production</li>
                <li>• Global shipping network</li>
                <li>• Order tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Creative Community</CardTitle>
              <CardDescription>
                Connect with designers and share your work
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Designer marketplace</li>
                <li>• Community challenges</li>
                <li>• Collaboration tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Seller Tools</CardTitle>
              <CardDescription>
                Turn your passion into profit with our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automated fulfillment</li>
                <li>• Analytics dashboard</li>
                <li>• Marketing tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Quality Guarantee</CardTitle>
              <CardDescription>
                We stand behind every product with our guarantee
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 100% satisfaction guarantee</li>
                <li>• Free returns & exchanges</li>
                <li>• Quality assurance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-12">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators who are already bringing their ideas to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate(user ? '/studio' : '/auth')}
            >
              <Shirt className="mr-2 h-5 w-5" />
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!user && (
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;