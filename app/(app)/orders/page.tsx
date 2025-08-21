"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight
} from "lucide-react"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("30")

  const mockOrders = [
    {
      id: 'ORD-2024-001',
      design: 'Sunset Vibes T-Shirt',
      customer: 'Alex Johnson',
      status: 'delivered',
      date: '2024-01-15',
      total: 18.99,
      quantity: 1,
      tracking: 'TRK123456789',
      product: 'T-Shirt',
      variant: 'Medium, Black'
    },
    {
      id: 'ORD-2024-002', 
      design: 'Urban Street Hoodie',
      customer: 'Sarah Chen',
      status: 'shipped',
      date: '2024-01-18',
      total: 34.99,
      quantity: 2,
      tracking: 'TRK987654321',
      product: 'Hoodie',
      variant: 'Large, Gray'
    },
    {
      id: 'ORD-2024-003',
      design: 'Minimal Logo Cap',
      customer: 'Mike Rodriguez',
      status: 'processing',
      date: '2024-01-20',
      total: 22.99,
      quantity: 1,
      tracking: null,
      product: 'Cap',
      variant: 'One Size, Navy'
    },
    {
      id: 'ORD-2024-004',
      design: 'Retro Wave Tote',
      customer: 'Emma Wilson',
      status: 'pending',
      date: '2024-01-21',
      total: 16.99,
      quantity: 3,
      tracking: null,
      product: 'Tote Bag',
      variant: 'Natural Canvas'
    }
  ]

  const getStatusIcon = (status: string) => {
    const iconProps = "w-4 h-4"
    switch (status) {
      case 'delivered':
        return <CheckCircle className={`${iconProps} text-emerald-500`} />
      case 'shipped':
        return <Truck className={`${iconProps} text-blue-500`} />
      case 'processing':
        return <Clock className={`${iconProps} text-amber-500`} />
      case 'pending':
        return <Package className={`${iconProps} text-muted-foreground`} />
      default:
        return <Package className={`${iconProps} text-muted-foreground`} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
      case 'shipped':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'processing':
        return 'bg-amber-500/10 text-amber-700 border-amber-200'
      case 'pending':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const orderStats = {
    total: mockOrders.length,
    revenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Order Management
                  </h1>
                  <p className="text-muted-foreground text-lg">Track, manage and fulfill your customer orders</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button size="lg" className="gap-2">
                <Upload className="w-4 h-4" />
                Import Orders
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold text-primary">{orderStats.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600">£{orderStats.revenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>+8.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/5 to-amber-500/10 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-3xl font-bold text-amber-600">{orderStats.processing}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                <span>Needs attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                  <p className="text-3xl font-bold text-blue-600">{orderStats.shipped}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                <span>In transit</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or order IDs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-11">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40 h-11">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {order.design}
                          </h3>
                          <p className="text-muted-foreground">{order.customer}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} border font-medium`}>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Order ID:</span>
                          <p className="font-medium">{order.id}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Product:</span>
                          <p className="font-medium">{order.product}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Variant:</span>
                          <p className="font-medium">{order.variant}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {order.tracking && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Tracking:</span>
                          <code className="px-2 py-1 bg-muted rounded font-mono text-xs">
                            {order.tracking}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">£{order.total}</p>
                        <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for non-delivered orders */}
                  {order.status !== 'delivered' && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Order Progress</span>
                        <span className="text-xs text-muted-foreground">
                          {order.status === 'pending' ? '25%' : 
                           order.status === 'processing' ? '50%' : 
                           order.status === 'shipped' ? '75%' : '100%'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: order.status === 'pending' ? '25%' : 
                                   order.status === 'processing' ? '50%' : 
                                   order.status === 'shipped' ? '75%' : '100%'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-3 text-xs">
                        <span className={order.status === 'pending' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          Order Placed
                        </span>
                        <span className={order.status === 'processing' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          Processing
                        </span>
                        <span className={order.status === 'shipped' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          Shipped
                        </span>
                        <span className={order.status === 'delivered' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          Delivered
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Your orders will appear here once customers start purchasing your designs'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button className="gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Create Your First Design
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}