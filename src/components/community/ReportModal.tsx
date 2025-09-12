import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ReportModalProps {
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  triggerButton?: React.ReactNode;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'other', label: 'Other' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  triggerButton
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to report content');
      return;
    }

    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const reason = selectedReason === 'other' 
        ? customReason.trim() 
        : REPORT_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason: reason
        });

      if (error) throw error;

      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
      setIsOpen(false);
      setSelectedReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help us understand what's wrong with this {targetType}. Your report will be reviewed by our moderation team.
          </p>
          
          <div className="space-y-3">
            <Label>Reason for reporting:</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="text-sm cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify:</Label>
              <Textarea
                id="custom-reason"
                placeholder="Describe why you're reporting this content..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};