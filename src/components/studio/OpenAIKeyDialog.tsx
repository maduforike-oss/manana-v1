import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, Info } from 'lucide-react';
import { setOpenAIKey, hasOpenAIKey } from '@/lib/ai/garmentGen';
import { toast } from 'sonner';

interface OpenAIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeySet?: () => void;
}

export const OpenAIKeyDialog: React.FC<OpenAIKeyDialogProps> = ({
  open,
  onOpenChange,
  onKeySet
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast.error('OpenAI API keys should start with "sk-"');
      return;
    }

    setIsLoading(true);
    
    try {
      // Test the API key by making a simple request
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!testResponse.ok) {
        throw new Error('Invalid API key');
      }

      // Save the key to localStorage
      setOpenAIKey(apiKey);
      toast.success('OpenAI API key saved successfully!');
      onOpenChange(false);
      onKeySet?.();
    } catch (error) {
      toast.error('Invalid API key. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    toast.info('You can use mock mode without an API key');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Key Required
          </DialogTitle>
          <DialogDescription>
            To generate high-quality garment images, you need an OpenAI API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your API key is stored securely in your browser's local storage and never sent to our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">How to get your API key:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit the OpenAI Platform</li>
              <li>Sign in to your account</li>
              <li>Go to API Keys section</li>
              <li>Create a new secret key</li>
              <li>Copy and paste it here</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get OpenAI API Key
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="flex-1"
            >
              {isLoading ? 'Validating...' : 'Save & Continue'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Use Mock Mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};