import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '../../lib/studio/store';
import { AIDesignCreator } from './AIDesignCreator';
import { 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Eye,
  Heart,
  Download,
  Edit3,
  Palette,
  Shirt,
  Brain
} from 'lucide-react';

export const StudioHub = () => {
  const [showAICreator, setShowAICreator] = useState(false);
  const { user, designs, createDesign, loadDesign } = useAppStore();
  const { setActiveTool } = useStudioStore();

  const handleNewDesign = () => {
    setShowAICreator(true);
  };

  const handleEditDesign = (designId: string) => {
    loadDesign(designId);
    // This will navigate to the actual studio with loading state
  };

  const recentDesigns = designs.slice(0, 6);

  if (showAICreator) {
    return <AIDesignCreator onBack={() => setShowAICreator(false)} />;
  }

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Design Studio</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Create amazing apparel designs with our professional tools
            </p>
          </div>
          <Button 
            onClick={handleNewDesign}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Design
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Edit3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Designs</p>
                  <p className="text-2xl font-bold text-foreground">{designs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{user?.designsThisMonth || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Usage</p>
                  <p className="text-2xl font-bold text-foreground">
                    {user?.designsThisMonth || 0}/{user?.maxDesigns || 20}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Heart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                  <Badge variant={user?.plan === 'premium' ? 'default' : 'secondary'}>
                    {user?.plan || 'basic'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50" onClick={handleNewDesign}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Design Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Let AI create the perfect design from your ideas or images. Smart, fast, and tailored to apparel.
              </p>
              <Button className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Create with AI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                Browse Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore pre-made templates to jumpstart your design process.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Download className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Trending Designs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                See what's popular in the community and get inspired.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Eye className="w-4 h-4 mr-2" />
                Browse Market
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Designs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Recent Designs</h2>
            {designs.length > 6 && (
              <Button variant="outline" size="sm">
                View All
              </Button>
            )}
          </div>

          {designs.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Palette className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No designs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first design to get started with our professional studio tools.
                  </p>
                  <Button onClick={handleNewDesign}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Design
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDesigns.map((design) => (
                <Card key={design.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Shirt className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{design.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 capitalize">
                      {design.garmentType.replace('-', ' ')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>Updated {new Date(design.updatedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {design.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {design.saves}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleEditDesign(design.id)}
                      className="w-full"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Design
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};