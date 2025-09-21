import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};