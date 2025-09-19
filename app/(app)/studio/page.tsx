import GarmentPicker from "@/components/GarmentPicker";
import SupabaseGarmentPicker from "@/components/studio/SupabaseGarmentPicker";
import RequireAuth from '@/components/auth/RequireAuth';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function StudioPage() {
  const [useSupabase, setUseSupabase] = useState(true);

  const onSelectStatic = (sel: any) => {
    // Handle static catalog selection
    const params = new URLSearchParams({
      garment: sel.garment.slug,
      colorIndex: String(sel.colorIndex),
      view: sel.view,
      size: sel.size
    }).toString();
    window.location.href = `/studio/editor?${params}`;
  };

  const onSelectSupabase = (sel: any) => {
    // Handle Supabase template selection
    const params = new URLSearchParams({
      garment: sel.garmentType,
      template: sel.template.name,
      view: sel.view,
      color: sel.template.color
    }).toString();
    window.location.href = `/studio/editor?${params}`;
  };

  return (
    <RequireAuth>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Design Studio</h1>
        <p className="text-muted-foreground mb-4">
          Pick a garment and view. You can add text, shapes, images and paint on top in the editor.
        </p>
        
        <div className="flex gap-2 mb-6">
          <Button 
            variant={useSupabase ? "default" : "outline"}
            onClick={() => setUseSupabase(true)}
          >
            All Templates ({useSupabase ? 'Active' : 'Switch'})
          </Button>
          <Button 
            variant={!useSupabase ? "default" : "outline"}
            onClick={() => setUseSupabase(false)}
          >
            Basic Catalog
          </Button>
        </div>

        {useSupabase ? (
          <SupabaseGarmentPicker onSelect={onSelectSupabase} />
        ) : (
          <GarmentPicker onSelect={onSelectStatic} />
        )}
      </main>
    </RequireAuth>
  );
}