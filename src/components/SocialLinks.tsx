import { Button } from '@/components/ui/button';
import { Globe, Instagram, Twitter, Linkedin } from 'lucide-react';

interface SocialLink {
  platform: 'website' | 'instagram' | 'twitter' | 'linkedin';
  url: string;
}

interface SocialLinksProps {
  links: SocialLink[];
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'website':
      return Globe;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'linkedin':
      return Linkedin;
    default:
      return Globe;
  }
};

export const SocialLinks = ({ links }: SocialLinksProps) => {
  if (links.length === 0) return null;

  return (
    <div className="flex gap-2">
      {links.map((link, index) => {
        const Icon = getSocialIcon(link.platform);
        return (
          <Button
            key={index}
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => window.open(link.url, '_blank')}
          >
            <Icon className="w-3 h-3" />
          </Button>
        );
      })}
    </div>
  );
};