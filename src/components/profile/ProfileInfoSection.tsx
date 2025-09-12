import { useState } from 'react';
import { Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { updateMyProfile } from '@/lib/profile';
import { sanitizeUsername, validateUsername } from '@/lib/usernames';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfileInfoSectionProps {
  title: string;
  value: string;
  field: 'display_name' | 'username' | 'bio';
  placeholder: string;
  isTextarea?: boolean;
  maxLength?: number;
}

export function ProfileInfoSection({ 
  title, 
  value, 
  field, 
  placeholder, 
  isTextarea = false,
  maxLength 
}: ProfileInfoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let processedValue = editValue;
      
      // Special handling for username
      if (field === 'username') {
        processedValue = sanitizeUsername(editValue);
        const validation = validateUsername(processedValue);
        if (!validation.isValid) {
          toast({
            title: 'Invalid username',
            description: validation.error,
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
      }

      await updateMyProfile({ [field]: processedValue });
      await refreshProfile();
      
      setIsEditing(false);
      toast({
        title: 'Updated successfully',
        description: `${title} has been updated`
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const displayValue = value || `No ${title.toLowerCase()} set`;
  const isEmpty = !value;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className={cn(
                  "text-sm truncate max-w-[300px]",
                  isEmpty ? "text-muted-foreground italic" : "text-foreground"
                )}>
                  {field === 'username' && value ? `@${value}` : displayValue}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsOpen(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {isEditing ? (
              <div className="space-y-3">
                {isTextarea ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      rows={3}
                    />
                    {maxLength && (
                      <p className="text-xs text-muted-foreground text-right">
                        {editValue.length}/{maxLength}
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                  />
                )}
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading || editValue === value}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {field === 'username' && value ? `@${value}` : (value || `Click edit to add your ${title.toLowerCase()}`)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit {title}
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}