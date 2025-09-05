import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Share2, ShoppingCart, Star, Eye, Download, Palette, Ruler, Layers, Info, User, Award, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { useLocalSaves } from '@/hooks/useLocalSaves';
import { useUnlockedDesigns } from '@/hooks/useUnlockedDesigns';
import { generateStudioMarketData, StudioGarmentData } from '@/lib/studio/marketData';
import { PurchaseGateModal } from '@/components/marketplace/PurchaseGateModal';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isSaved, toggle: toggleSave } = useLocalSaves();
  const { isUnlocked } = useUnlockedDesigns();
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [showPurchaseGate, setShowPurchaseGate] = useState(false);
  const [purchaseGateDesign, setPurchaseGateDesign] = useState<StudioGarmentData | null>(null);

  // Get the item from our data (in real app, this would be an API call)
  const allDesigns = generateStudioMarketData();
  const item = allDesigns.find(design => design.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button onClick={() => navigate('/')}>Back to Market</Button>
        </div>
      </div>
    );
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'Gray', value: 'gray', hex: '#9CA3AF' },
    { name: 'Navy', value: 'navy', hex: '#1E3A8A' }
  ];

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }

    addToCart({
      id: `${item.id}-${selectedSize}-${selectedColor}`,
      designId: item.id,
      name: item.name,
      image: item.thumbSrc,
      price: item.price,
      size: selectedSize,
      color: selectedColor,
      garmentType: item.garmentId,
      creator: item.creator,
      listingType: 'print-design'
    });

    toast({ 
      title: "Added to cart",
      description: `${item.name} (${selectedSize}, ${selectedColor}) added to your cart`
    });
  };

  const handleCustomizeInStudio = () => {
    if (isUnlocked(item.id)) {
      const params = new URLSearchParams({
        garment: item.garmentId,
        orientation: item.orientation,
        mmToPx: String(item.mmToPx),
        safeWmm: String(item.safeArea.w),
        safeHmm: String(item.safeArea.h),
        view: item.orientation,
        size: selectedSize,
        design: item.id
      }).toString();
      
      window.location.href = `/studio/editor?${params}`;
    } else {
      setPurchaseGateDesign(item);
      setShowPurchaseGate(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Item Details</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSave(item.id)}
                className="rounded-full"
              >
                <Bookmark className={`h-4 w-4 ${isSaved(item.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square">
                <img 
                  src={item.thumbSrc} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-2">
              {item.availableOrientations.map((orientation) => (
                <Card key={orientation} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary">
                  <div className="aspect-square">
                    <img 
                      src={item.thumbSrc} 
                      alt={`${orientation} view`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold">{item.name}</h1>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{item.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{item.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>{item.downloads}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary mb-4">
                ${item.price.toFixed(2)}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Creator Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{item.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{item.creator}</div>
                    <div className="text-sm text-muted-foreground">Design Studio</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Options */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedColor === color.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-xs mt-1">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                className="w-full h-12"
                disabled={!selectedColor}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                onClick={handleCustomizeInStudio}
                variant="outline"
                className="w-full h-12"
              >
                <Palette className="h-4 w-4 mr-2" />
                Customize in Studio
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>{item.shippingDays} shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Quality guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-primary" />
                <span>Premium quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="sizing">Size Guide</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Product Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Fabric:</span> {item.fabric}
                    </div>
                    <div>
                      <span className="font-medium">Print Area:</span> {item.printArea.width}mm x {item.printArea.height}mm
                    </div>
                    <div>
                      <span className="font-medium">Available Views:</span> {item.availableOrientations.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Studio Features:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.studioReady.map((feature) => (
                          <Badge key={feature} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Resolution:</span> {item.dpi} DPI
                    </div>
                    <div>
                      <span className="font-medium">MM to PX:</span> {item.mmToPx}
                    </div>
                    <div>
                      <span className="font-medium">Safe Area:</span> {item.safeArea.w}mm x {item.safeArea.h}mm
                    </div>
                    <div>
                      <span className="font-medium">Base Color:</span> {item.baseColor}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sizing" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Size Guide</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Chest (inches)</th>
                          <th className="text-left p-2">Length (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableSizes.map((size, index) => (
                          <tr key={size} className="border-b">
                            <td className="p-2 font-medium">{size}</td>
                            <td className="p-2">{32 + index * 2} - {34 + index * 2}</td>
                            <td className="p-2">{26 + index}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Customer Reviews</h3>
                  <div className="text-center text-muted-foreground py-8">
                    Reviews coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PurchaseGateModal
        open={showPurchaseGate}
        onOpenChange={setShowPurchaseGate}
        design={purchaseGateDesign}
      />
    </div>
  );
}