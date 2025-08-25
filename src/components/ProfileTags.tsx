import { Badge } from '@/components/ui/badge';

interface ProfileTagsProps {
  specialties: string[];
  maxDisplay?: number;
}

export const ProfileTags = ({ specialties, maxDisplay = 4 }: ProfileTagsProps) => {
  const displayTags = specialties.slice(0, maxDisplay);
  const remainingCount = specialties.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((specialty, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="text-xs bg-muted/50 text-muted-foreground hover:bg-muted"
        >
          {specialty}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};