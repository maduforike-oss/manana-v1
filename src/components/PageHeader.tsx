import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  activeTab?: 'market' | 'community' | 'studio' | 'orders' | 'profile';
  showBreadcrumbs?: boolean;
  breadcrumbItems?: Array<{ label: string; href?: string; isActive?: boolean }>;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  onBack, 
  activeTab, 
  showBreadcrumbs = true,
  breadcrumbItems 
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { setActiveTab } = useAppStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Set appropriate tab before navigating back
      if (activeTab) {
        setActiveTab(activeTab);
      }
      navigate('/');
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {showBreadcrumbs && (
        <Breadcrumbs items={breadcrumbItems} />
      )}
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          aria-label="Go back"
          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" id="page-title">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};