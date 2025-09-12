import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function CancelOrderModal({ orderId, orderNumber, onClose, onConfirm }: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement order cancellation in database
      // await cancelOrder({ orderId, reason });
      
      toast({
        title: "Order cancelled",
        description: `Order ${orderNumber} has been successfully cancelled.`
      });
      
      onConfirm?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel order {orderNumber}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cancellation Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">What happens when you cancel:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your order will be stopped from processing</li>
              <li>• You'll receive a full refund within 3-5 business days</li>
              <li>• You'll get an email confirmation of the cancellation</li>
            </ul>
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation (Optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Help us improve by telling us why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reason.length}/500 characters
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelling..." : "Cancel Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}