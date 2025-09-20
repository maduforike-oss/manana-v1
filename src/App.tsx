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
import { ProfileSettings } from "./pages/ProfileSettings";
import { UpgradePlan } from "./pages/UpgradePlan";
import Followers from "./pages/Followers";
import UserProfile from "./pages/UserProfile";
import ProfileHub from "./pages/ProfileHub";
import ProfileEdit from "./pages/ProfileEdit";
import UserProfilePublic from "./pages/UserProfilePublic";
import { UnifiedStudioShell } from "./components/studio/UnifiedStudioShell";
import { StudioDesigns } from "./pages/StudioDesigns";
import ItemDetail from "./pages/ItemDetail";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import Cart from "./pages/Cart";
import SellNew from "./pages/SellNew";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminTemplates from "./pages/AdminTemplates";
import TemplatesUploader from "./pages/admin/TemplatesUploader";
import RequireAuth from "./components/auth/RequireAuth";
import { useEffect, useState } from "react";
import { MobileFallback } from "./components/MobileFallback";

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
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if mobile and if there are rendering issues
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // Show fallback if mobile and localStorage is not available
      if (mobile && !('localStorage' in window)) {
        setShowFallback(true);
      }
    };

    checkMobile();

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
                  <RequireAuth><UnifiedStudioShell /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/studio/designs" element={
                <AppLayout>
                  <RequireAuth><StudioDesigns /></RequireAuth>
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
                  <RequireAuth><ProfileHub /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/edit" element={
                <AppLayout>
                  <RequireAuth><ProfileEdit /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/profile/settings" element={
                <AppLayout>
                  <RequireAuth><ProfileSettings /></RequireAuth>
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
                  <RequireAuth><AdminTemplates /></RequireAuth>
                </AppLayout>
              } />
              <Route path="/admin/templates-uploader" element={
                <AppLayout>
                  <RequireAuth><TemplatesUploader /></RequireAuth>
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
