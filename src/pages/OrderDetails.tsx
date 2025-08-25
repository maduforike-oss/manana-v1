import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  User,
  CreditCard,
  Download,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Hash,
  ShoppingBag,
  Palette,
  Shirt,
  Star,
  Heart,
  Share2
} from "lucide-react"

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock order data - in real app this would come from API
  const orderDetails = {
    id: id || 'ORD-2024-001',
    design: 'Sunset Vibes T-Shirt',
    customer: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567'
    },
    status: 'shipped',
    date: '2024-01-15',
    total: 18.99,
    quantity: 1,
    tracking: 'TRK123456789',
    product: 'T-Shirt',
    variant: 'Medium, Black',
    shippingAddress: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    designDetails: {
      colors: ['#FF6B35', '#F7931E', '#FFD23F'],
      dimensions: '10" x 12"',
      placement: 'Front Center',
      technique: 'Direct-to-Garment'
    },
    timeline: [
      {
        status: 'Order Placed',
        date: '2024-01-15 10:30 AM',
        description: 'Order received and payment confirmed',
        completed: true
      },
      {
        status: 'Design Processing',
        date: '2024-01-15 2:45 PM',
        description: 'Design prepared for printing',
        completed: true
      },
      {
        status: 'In Production',
        date: '2024-01-16 9:15 AM',
        description: 'Item being printed and prepared',
        completed: true
      },
      {
        status: 'Quality Check',
        date: '2024-01-17 11:20 AM',
        description: 'Quality inspection completed',
        completed: true
      },
      {
        status: 'Shipped',
        date: '2024-01-17 4:30 PM',
        description: 'Package handed to carrier',
        completed: true,
        tracking: 'TRK123456789'
      },
      {
        status: 'Out for Delivery',
        date: '2024-01-19 8:00 AM',
        description: 'Package out for delivery',
        completed: false,
        estimated: true
      },
      {
        status: 'Delivered',
        date: '2024-01-19 6:00 PM',
        description: 'Package delivered to recipient',
        completed: false,
        estimated: true
      }
    ]
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    const iconProps = `w-5 h-5 ${completed ? 'text-primary' : 'text-muted-foreground'}`
    switch (status.toLowerCase().replace(/\s+/g, '')) {
      case 'orderplaced':
        return <ShoppingBag className={iconProps} />
      case 'designprocessing':
        return <Palette className={iconProps} />
      case 'inproduction':
      case 'qualitycheck':
        return <Package className={iconProps} />
      case 'shipped':
      case 'outfordelivery':
        return <Truck className={iconProps} />
      case 'delivered':
        return <CheckCircle className={iconProps} />
      default:
        return <Clock className={iconProps} />
    }
  }

  const completedSteps = orderDetails.timeline.filter(step => step.completed).length
  const progressPercentage = (completedSteps / orderDetails.timeline.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary))_25%,hsl(var(--primary))_50%,transparent_50%)] opacity-[0.02]" />
        
        <div className="relative px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2 hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {orderDetails.design}
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Order #{orderDetails.id} • {orderDetails.customer.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 px-4 py-2">
                  <Truck className="w-4 h-4 mr-2" />
                  {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">Premium Quality</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2 hover:scale-105 transition-all duration-200 shadow-lg">
                <Download className="w-5 h-5" />
                Download Invoice
              </Button>
              <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-all duration-200">
                <MessageCircle className="w-5 h-5" />
                Contact Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Order Progress */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              Live Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                <p className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Estimated Delivery</span>
                <p className="font-medium">Jan 19, 2024</p>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-3 bg-muted" />
            
            <div className="grid gap-6">
              {orderDetails.timeline.map((step, index) => (
                <div key={index} className={`relative flex items-start gap-6 p-4 rounded-xl border transition-all duration-300 ${
                  step.completed 
                    ? 'bg-primary/5 border-primary/20 shadow-sm' 
                    : step.estimated 
                      ? 'bg-muted/30 border-border/50' 
                      : 'bg-amber-500/5 border-amber-500/20 shadow-sm'
                }`}>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    step.completed 
                      ? 'border-primary bg-primary/10 shadow-lg' 
                      : step.estimated 
                        ? 'border-muted bg-muted' 
                        : 'border-amber-500 bg-amber-500/10 shadow-lg'
                  }`}>
                    {getStatusIcon(step.status, step.completed)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold text-lg ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.status}
                      </h4>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        step.completed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.estimated ? 'Est. ' : ''}{step.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{step.description}</p>
                    {step.tracking && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-background/80 rounded-lg border">
                        <span className="text-xs font-medium text-muted-foreground">Tracking:</span>
                        <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                          {step.tracking}
                        </code>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <span className="text-xs">Track</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Order Information */}
          <div className="xl:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                      <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                      <p className="text-lg font-bold text-primary">{orderDetails.id}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 rounded-xl">
                      <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                      <p className="text-2xl font-bold text-emerald-600">£{orderDetails.total}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                      <p className="text-lg font-medium">{new Date(orderDetails.date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                      <p className="text-lg font-medium">{orderDetails.quantity} item(s)</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Enhanced Product Section */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-primary" />
                    Product Details
                  </h4>
                  
                  <div className="grid gap-6">
                    <div className="p-6 bg-gradient-to-r from-background/50 to-muted/20 rounded-xl border">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                          <Shirt className="w-10 h-10 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-lg mb-2">{orderDetails.design}</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Product:</span>
                              <p className="font-medium">{orderDetails.product}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Variant:</span>
                              <p className="font-medium">{orderDetails.variant}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Enhanced Design Specifications */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Design Specifications
                  </h4>
                  
                  <div className="grid gap-4">
                    <div className="p-4 bg-background/50 rounded-xl border">
                      <label className="text-sm font-medium text-muted-foreground mb-3 block">Color Palette</label>
                      <div className="flex gap-3">
                        {orderDetails.designDetails.colors.map((color, index) => (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-full border-2 border-border shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background/50 rounded-xl border">
                        <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                        <p className="font-medium text-lg">{orderDetails.designDetails.dimensions}</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-xl border">
                        <label className="text-sm font-medium text-muted-foreground">Placement</label>
                        <p className="font-medium text-lg">{orderDetails.designDetails.placement}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-background/50 rounded-xl border">
                      <label className="text-sm font-medium text-muted-foreground">Print Technique</label>
                      <p className="font-medium text-lg">{orderDetails.designDetails.technique}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Customer Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-background/50 to-muted/20 rounded-xl">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-semibold text-lg">{orderDetails.customer.name}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">{orderDetails.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm">{orderDetails.customer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-background/50 to-muted/20 rounded-xl space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.line1}</p>
                  {orderDetails.shippingAddress.line2 && (
                    <p className="text-muted-foreground">{orderDetails.shippingAddress.line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
                  </p>
                  <p className="text-muted-foreground font-medium">{orderDetails.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3 h-12 text-left hover:scale-[1.02] transition-all duration-200">
                  <MessageCircle className="w-5 h-5" />
                  Send Customer Update
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-left hover:scale-[1.02] transition-all duration-200">
                  <Download className="w-5 h-5" />
                  Download Shipping Label
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-left hover:scale-[1.02] transition-all duration-200">
                  <CreditCard className="w-5 h-5" />
                  Process Refund
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}