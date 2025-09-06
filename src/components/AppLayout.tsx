import { AppleBottomNavigation } from './AppleBottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-24">
        {children}
      </main>
      
      {/* Apple-Style Bottom Navigation */}
      <AppleBottomNavigation />
    </div>
  );
};