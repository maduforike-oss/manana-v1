import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignTab } from '../studio/DesignTab';
import { MaterialTab } from '../studio/MaterialTab';
import { PreviewTab } from '../studio/PreviewTab';
import { PricingTab } from '../studio/PricingTab';
import { useStudioStore } from '../studio/store';

type TabId = "profile"|"orders"|"studio"|"community"|"market";
const BottomTabs: React.FC<{ active?: TabId; activeTab?: TabId }> = ({ active, activeTab }) => {
  const current = (active ?? activeTab ?? "studio") as TabId;
  const Tab = ({ label, path, id }: { label: string; path: string; id: TabId }) => (
    <button
      onClick={() => (window.location.href = path)}
      className={
        "px-3 py-2 rounded-md border " +
        (current === id ? "bg-black text-white border-black" : "bg-white text-black hover:bg-neutral-50")
      }
    >
      {label}
    </button>
  );
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-white/90 backdrop-blur border rounded-xl p-2 shadow">
      <Tab id="profile"   label="Profile"   path="/profile" />
      <Tab id="orders"    label="Orders"    path="/orders" />
      <Tab id="studio"    label="Studio"    path="/studio" />
      <Tab id="community" label="Community" path="/community" />
      <Tab id="market"    label="Market"    path="/market" />
    </div>
  );
};

// Query param support for garment configuration
const useQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    mockup: params.get('mockup') || '',
    size: params.get('size') || 'M',
    mmToPx: parseFloat(params.get('mmToPx') || '3.543'),
    safeWmm: parseFloat(params.get('safeWmm') || '280'),
    safeHmm: parseFloat(params.get('safeHmm') || '380'),
    view: params.get('view') || 'front',
    garment: params.get('garment') || 't-shirt'
  };
};

const StudioPro: React.FC = () => {
  const [activeTab, setActiveTab] = useState('design');
  const queryParams = useQueryParams();
  const { loadGarment } = useStudioStore();

  // Initialize garment from query params
  React.useEffect(() => {
    if (queryParams.garment || queryParams.size || queryParams.view) {
      loadGarment({
        slug: queryParams.garment,
        size: queryParams.size as any,
        view: queryParams.view as any,
        mmToPx: queryParams.mmToPx
      });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Studio Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-border/50 bg-card">
            <div className="container mx-auto">
              <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="design" className="h-full m-0">
              <DesignTab />
            </TabsContent>
            
            <TabsContent value="material" className="h-full m-0 overflow-auto">
              <MaterialTab />
            </TabsContent>
            
            <TabsContent value="preview" className="h-full m-0 overflow-auto">
              <PreviewTab />
            </TabsContent>
            
            <TabsContent value="pricing" className="h-full m-0 overflow-auto">
              <PricingTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomTabs active="studio" />
    </div>
  );
};

export default StudioPro;