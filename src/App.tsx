import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OrderDetails from "./pages/OrderDetails";
import { ProfileSettings } from "./pages/ProfileSettings";
import { UpgradePlan } from "./pages/UpgradePlan";
import Followers from "./pages/Followers";
import UserProfile from "./pages/UserProfile";
import ProfileHub from "./pages/ProfileHub";
import ProfileEdit from "./pages/ProfileEdit";
import UserProfilePublic from "./pages/UserProfilePublic";
import { StudioPage } from "./components/pages/StudioPage";
import StudioEditor from "./pages/StudioEditor";
import StudioPro from "./pages/StudioPro";
import ItemDetail from "./pages/ItemDetail";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import Cart from "./pages/Cart";
import SellNew from "./pages/SellNew";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminTemplates from "./pages/AdminTemplates";
import TemplatesUploader from "./pages/admin/TemplatesUploader";
import RequireAuth from "./components/auth/RequireAuth";
import { useEffect } from "react";

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
  useEffect(() => {
    // Register service worker for offline support
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/studio" element={<RequireAuth><StudioPro /></RequireAuth>} />
              <Route path="/studio/editor" element={<RequireAuth><StudioEditor /></RequireAuth>} />
              <Route path="/studio/legacy" element={<RequireAuth><StudioPage /></RequireAuth>} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/sell/new" element={<RequireAuth><SellNew /></RequireAuth>} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/checkout/success" element={<RequireAuth><CheckoutSuccess /></RequireAuth>} />
              <Route path="/orders/:id" element={<RequireAuth><OrderDetails /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><ProfileHub /></RequireAuth>} />
              <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
              <Route path="/profile/settings" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
              <Route path="/profile/upgrade" element={<RequireAuth><UpgradePlan /></RequireAuth>} />
              <Route path="/profile/followers" element={<RequireAuth><Followers /></RequireAuth>} />
              <Route path="/users/:userId" element={<UserProfile />} />
              <Route path="/u/:username" element={<UserProfilePublic />} />
              <Route path="/admin/templates" element={<RequireAuth><AdminTemplates /></RequireAuth>} />
              <Route path="/admin/templates-uploader" element={<RequireAuth><TemplatesUploader /></RequireAuth>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
