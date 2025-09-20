import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthProvider } from "@/lib/auth-context";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import OrderDetails from "./pages/OrderDetails";
import { UpgradePlan } from "./pages/UpgradePlan";
import Followers from "./pages/Followers";
import UserProfile from "./pages/UserProfile";
import UserProfilePublic from "./pages/UserProfilePublic";
import ItemDetail from "./pages/ItemDetail";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import Cart from "./pages/Cart";
import SellNew from "./pages/SellNew";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import RequireAuth from "./components/auth/RequireAuth";
import { useEffect, useState, Suspense } from "react";
import { MobileFallback } from "./components/MobileFallback";
import { useIsMobile } from "./hooks/use-mobile";
import { MobileStudioShell } from "./components/MobileStudioShell";
// Lazy imports for performance
import {
  UnifiedStudioShell,
  ProfileHub,
  ProfileEdit,
  ProfileSettings,
  AdminTemplates,
  TemplatesUploader
} from "./components/LazyComponents";
import {
  StudioLoadingFallback,
  PageLoadingFallback,
  ProfileLoadingFallback,
  AdminLoadingFallback
} from "./components/LoadingFallbacks";
import { 
  preloadCriticalAssets, 
  setupIntelligentPreloading, 
  addResourceHints 
} from "./utils/preloadUtils";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { useMemoryOptimizer } from "./components/optimized/MemoryOptimizer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  const [showFallback, setShowFallback] = useState(false);
  const isMobile = useIsMobile();
  
  // Memory optimization
  useMemoryOptimizer();

  useEffect(() => {
    // Performance optimizations
    addResourceHints();
    preloadCriticalAssets();
    
    // Setup intelligent preloading after initial render
    const setupPreloading = () => setupIntelligentPreloading();
    if (window.requestIdleCallback) {
      requestIdleCallback(setupPreloading);
    } else {
      setTimeout(setupPreloading, 100);
    }

    // Only show fallback for localStorage issues, not for all mobile devices
    if (isMobile && !('localStorage' in window)) {
      setShowFallback(true);
    }

    // Register service worker for offline support
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'));
    }

    // Handle errors and show fallback on mobile if needed
    const handleError = (event: ErrorEvent) => {
      console.error('[App] Unhandled error:', event.error);
      if (isMobile) {
        setShowFallback(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [isMobile]);

  // Show mobile fallback if needed
  if (showFallback) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <MobileFallback />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/" element={
                <AppLayout>
                  <Index />
                </AppLayout>
              } />
              <Route path="/studio" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<StudioLoadingFallback />}>
                      {isMobile ? <MobileStudioShell /> : <UnifiedStudioShell />}
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              <Route path="/item/:id" element={
                <AppLayout>
                  <ItemDetail />
                </AppLayout>
              } />
              <Route path="/product/:id" element={
                <AppLayout>
                  <ProductDetailPage />
                </AppLayout>
              } />
              <Route path="/cart" element={
                <AppLayout>
                  <Cart />
                </AppLayout>
              } />
              <Route path="/sell/new" element={
                <AppLayout>
                  <RequireAuth><SellNew /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/checkout" element={
                <AppLayout>
                  <RequireAuth><Checkout /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/checkout/success" element={
                <AppLayout>
                  <RequireAuth><CheckoutSuccess /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/orders/:id" element={
                <AppLayout>
                  <RequireAuth><OrderDetails /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<ProfileLoadingFallback />}>
                      <ProfileHub />
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/edit" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<ProfileLoadingFallback />}>
                      <ProfileEdit />
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/settings" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<ProfileLoadingFallback />}>
                      <ProfileSettings />
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/upgrade" element={
                <AppLayout>
                  <RequireAuth><UpgradePlan /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/followers" element={
                <AppLayout>
                  <RequireAuth><Followers /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/users/:userId" element={
                <AppLayout>
                  <UserProfile />
                </AppLayout>
              } />
              <Route path="/u/:username" element={
                <AppLayout>
                  <UserProfilePublic />
                </AppLayout>
              } />
              <Route path="/admin/templates" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <AdminTemplates />
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              <Route path="/admin/templates-uploader" element={
                <AppLayout>
                  <RequireAuth>
                    <Suspense fallback={<AdminLoadingFallback />}>
                      <TemplatesUploader />
                    </Suspense>
                  </RequireAuth>
                </AppLayout>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
