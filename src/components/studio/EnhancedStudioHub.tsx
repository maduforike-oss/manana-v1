import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrandHeader } from '@/components/ui/brand-header';
import { Logo } from '@/components/brand/Logo';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '../../lib/studio/store';
import { AIDesignCreator } from './AIDesignCreator';
import { useDesignManagement } from '@/hooks/useDesignManagement';
import type { DesignDocument } from '@/hooks/useDesignManagement';
import { DesignGrid, DesignCardData } from '@/components/design/DesignGrid';
import { useAuth } from '@/lib/auth-context';
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
  Brain,
  Zap,
  Star,
  PlayCircle,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const EnhancedStudioHub = () => {
  const [showAICreator, setShowAICreator] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { user } = useAppStore();
  const { user: authUser } = useAuth();
  const { designs, loading, listDesigns, deleteDesign } = useDesignManagement();

  useEffect(() => {
    listDesigns();
  }, [listDesigns]);

  const handleNewDesign = () => {
    setShowAICreator(true);
  };

  const handleEditDesign = (designId: string) => {
    // Navigate to studio with design loaded
    window.location.href = `/studio?design=${designId}`;
  };

  const handleDeleteDesign = async (designId: string) => {
    await deleteDesign(designId);
    setDeleteDialogOpen(false);
    setDesignToDelete(null);
  };

  const openDeleteDialog = (designId: string) => {
    setDesignToDelete(designId);
    setDeleteDialogOpen(true);
  };

  const handleViewAllDesigns = () => {
    window.location.href = '/studio/designs';
  };

  const handlePrintifySync = async () => {
    setSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('printify-sync', {
        method: 'POST'
      });

      if (error) {
        toast.error('Failed to sync Printify catalog', {
          description: error.message
        });
        return;
      }

      setLastSyncTime(new Date());
      toast.success('Printify catalog synced successfully', {
        description: `Synced ${data.synced} products (${data.errors} errors)`
      });
    } catch (err) {
      toast.error('An error occurred during sync');
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const designsThisMonth = designs.filter(design => {
    const designDate = new Date(design.created_at);
    return designDate.getMonth() === currentMonth && designDate.getFullYear() === currentYear;
  }).length;

  const recentDesigns = designs.slice(0, 6);

  if (showAICreator) {
    return <AIDesignCreator onBack={() => setShowAICreator(false)} />;
  }

  return (
    <div className="h-full bg-background overflow-auto">
      <BrandHeader 
        title="Design Studio" 
        subtitle="Create amazing apparel designs with professional tools"
      />
      
      <div className="container mx-auto py-8 px-6 max-w-7xl space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  <Star className="w-4 h-4" />
                  Professional Design Suite
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Bring Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vision</span> to Life
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Transform ideas into stunning apparel designs with AI-powered tools, professional templates, and industry-grade precision.
                </p>
              </div>
              <Button 
                onClick={handleNewDesign}
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-2xl rounded-2xl px-8 py-6 text-lg font-semibold feedback-glow"
              >
                <Logo size={24} showWordmark={false} className="mr-3" />
                <span>Create Design</span>
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-primary animate-pulse" />
            <div className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-secondary animate-pulse delay-75" />
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card 
            className="glass-effect border-border/20 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all"
            onClick={handleViewAllDesigns}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                <Edit3 className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary" className="rounded-full">All Time</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Total Designs</p>
              <p className="text-3xl font-bold text-foreground">{designs.length}</p>
            </div>
          </Card>
          
          <Card className="glass-effect border-border/20 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <Badge variant="secondary" className="rounded-full">This Month</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Designs Created</p>
              <p className="text-3xl font-bold text-foreground">{designsThisMonth}</p>
            </div>
          </Card>
          
          <Card className="glass-effect border-border/20 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <Badge variant="secondary" className="rounded-full">
                {Math.round((designsThisMonth / (user?.maxDesigns || 20)) * 100)}%
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Plan Usage</p>
                <p className="text-3xl font-bold text-foreground">
                  {designsThisMonth}<span className="text-lg text-muted-foreground">/{user?.maxDesigns || 20}</span>
                </p>
              </div>
              <Progress value={(designsThisMonth / (user?.maxDesigns || 20)) * 100} className="h-2" />
            </div>
          </Card>
          
          <Card className="glass-effect border-border/20 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl">
                <Heart className="w-6 h-6 text-purple-500" />
              </div>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Current Plan</p>
              <Badge 
                variant={user?.plan === 'premium' ? 'default' : 'secondary'} 
                className="text-lg px-3 py-1 rounded-full font-semibold"
              >
                {(user?.plan || 'basic').toUpperCase()}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Creative Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Design Creator - Featured */}
          <Card 
            className="lg:col-span-2 relative overflow-hidden glass-effect border-2 border-primary/20 hover:border-primary/40 cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 rounded-3xl"
            onClick={handleNewDesign}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  AI Design Creator
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Transform your ideas into stunning apparel designs with our advanced AI. Upload inspiration images, describe your vision, or let AI surprise you with creative concepts.
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="rounded-full">Smart Generation</Badge>
                  <Badge variant="secondary" className="rounded-full">Image Analysis</Badge>
                  <Badge variant="secondary" className="rounded-full">Style Transfer</Badge>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white rounded-2xl py-6 text-lg font-semibold shadow-lg group-hover:shadow-primary/30 transition-all"
              >
                <Logo size={20} showWordmark={false} className="mr-2" />
                Create with AI
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start Option */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">Browse templates & start designing</p>
                  </div>
                </div>
                <Button 
                  onClick={handleNewDesign}
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Start <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sync Printify Catalog */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Sync Printify Catalog</h3>
                    <p className="text-sm text-muted-foreground">Update available products from Printify</p>
                    {lastSyncTime && (
                      <Badge variant="secondary" className="text-xs">
                        Last synced: {lastSyncTime.toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handlePrintifySync}
                  variant="ghost"
                  size="sm"
                  disabled={syncing}
                  className="group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      Sync Now <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Designs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Recent Designs</h2>
              <p className="text-muted-foreground mt-1">Continue working on your latest creations</p>
            </div>
            {designs.length > 6 && (
              <Button variant="outline" className="rounded-xl" onClick={handleViewAllDesigns}>
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </div>

          {loading ? (
            <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Loading your designs...</p>
              </div>
            </Card>
          ) : designs.length === 0 ? (
            <Card className="glass-effect border-border/20 rounded-3xl p-16 text-center">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl">
                  <Palette className="w-16 h-16 text-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Start Your Creative Journey</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Ready to create your first masterpiece? Our professional design tools are waiting for your creativity.
                  </p>
                  <Button 
                    onClick={handleNewDesign}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg"
                  >
                    <Logo size={20} showWordmark={false} className="mr-2" />
                    Create First Design
                    <Plus className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDesigns.map((design, index) => (
                <Card 
                  key={design.id} 
                  className="glass-effect border-border/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-2xl m-4 flex items-center justify-center overflow-hidden">
                      <Shirt className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute top-6 right-6 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      {design.garment_type.replace('-', ' ')}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-6 left-6 rounded-full bg-background/80 backdrop-blur-sm h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleEditDesign(design.id)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Design
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(design.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Design
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardContent className="p-6 pt-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {design.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Updated {new Date(design.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handleEditDesign(design.id)}
                        className="w-full rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
                        variant="outline"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Continue Editing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => designToDelete && handleDeleteDesign(designToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};