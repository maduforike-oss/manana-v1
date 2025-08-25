"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Shirt
} from "lucide-react"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  // Mock order data - in real app this would come from API
  const orderDetails = {
    id: orderId || 'ORD-2024-001',
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
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
        <div className="relative px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-muted-foreground text-lg">
                Track and manage order {orderDetails.id}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Order Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="space-y-4">
              {orderDetails.timeline.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    step.completed 
                      ? 'border-primary bg-primary/10' 
                      : step.estimated 
                        ? 'border-muted bg-muted' 
                        : 'border-amber-500 bg-amber-500/10'
                  }`}>
                    {getStatusIcon(step.status, step.completed)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.status}
                      </h4>
                      <span className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.estimated ? 'Est. ' : ''}{step.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    {step.tracking && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Tracking: </span>
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {step.tracking}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Order ID</label>
                  <p className="font-medium">{orderDetails.id}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                      <Truck className="w-3 h-3 mr-1" />
                      Shipped
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Order Date</label>
                  <p className="font-medium">{new Date(orderDetails.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Total Amount</label>
                  <p className="font-medium text-primary">£{orderDetails.total}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  Product Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Design</label>
                    <p className="font-medium">{orderDetails.design}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Product</label>
                      <p className="font-medium">{orderDetails.product}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Variant</label>
                      <p className="font-medium">{orderDetails.variant}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Quantity</label>
                      <p className="font-medium">{orderDetails.quantity}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Technique</label>
                      <p className="font-medium">{orderDetails.designDetails.technique}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Design Specifications
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Colors Used</label>
                    <div className="flex gap-2 mt-1">
                      {orderDetails.designDetails.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Dimensions</label>
                      <p className="font-medium">{orderDetails.designDetails.dimensions}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Placement</label>
                      <p className="font-medium">{orderDetails.designDetails.placement}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping */}
          <div className="space-y-8">
            {/* Customer Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{orderDetails.customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{orderDetails.customer.email}</p>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{orderDetails.customer.phone}</p>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.line1}</p>
                  {orderDetails.shippingAddress.line2 && (
                    <p className="text-muted-foreground">{orderDetails.shippingAddress.line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zip}
                  </p>
                  <p className="text-muted-foreground">{orderDetails.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Send Customer Update
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Download Shipping Label
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CreditCard className="w-4 h-4" />
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