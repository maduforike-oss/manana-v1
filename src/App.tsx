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
import { StudioPage } from "./components/pages/StudioPage";
import StudioEditor from "./pages/StudioEditor";
import StudioPro from "./pages/StudioPro";
import ItemDetail from "./pages/ItemDetail";
import Cart from "./pages/Cart";
import AddListing from "./pages/AddListing";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/studio" element={<StudioPro />} />
            <Route path="/studio/editor" element={<StudioEditor />} />
            <Route path="/studio/legacy" element={<StudioPage />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/add-listing" element={<AddListing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/profile/upgrade" element={<UpgradePlan />} />
            <Route path="/profile/followers" element={<Followers />} />
            <Route path="/users/:userId" element={<UserProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
