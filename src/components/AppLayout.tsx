import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-dvh h-dvh md:min-h-screen md:h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 scroll-content-viewport touch-context-scroll">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};