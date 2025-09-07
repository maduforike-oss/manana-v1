import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const designId = searchParams.get('design');
  const price = searchParams.get('price');

  useEffect(() => {
    if (!designId || !price) {
      navigate('/');
    }
  }, [designId, price, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to success page with design ID
    navigate(`/checkout/success?design=${designId}`);
  };

  if (!designId || !price) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase to unlock design customization</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Design License</span>
                <span>${price}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${price}</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Full customization rights</li>
                  <li>• High-resolution exports</li>
                  <li>• Commercial usage license</li>
                  <li>• Studio editing access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    defaultValue="demo@example.com"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <Input 
                    id="card" 
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY"
                      defaultValue="12/25"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input 
                      id="cvc" 
                      placeholder="123"
                      defaultValue="123"
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe"
                    defaultValue="Demo User"
                    required 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Lock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${price}`
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  This is a demo checkout. No real payment will be processed.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}