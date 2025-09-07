import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  activeTab?: 'market' | 'community' | 'studio' | 'orders' | 'profile';
}

export const PageHeader = ({ title, subtitle, onBack, activeTab }: PageHeaderProps) => {
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
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={handleBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};