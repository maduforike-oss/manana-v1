import GarmentPicker from "@/components/GarmentPicker";
import RequireAuth from '@/components/auth/RequireAuth';

export default function StudioPage() {
  const onSelect = (sel: any) => {
    // Minimal: stash selection and route to editor with query params
    const params = new URLSearchParams({
      garment: sel.garment.slug,
      colorIndex: String(sel.colorIndex),
      view: sel.view,
      size: sel.size
    }).toString();
    window.location.href = `/studio/editor?${params}`;
  };

  return (
    <RequireAuth>
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Design Studio</h1>
        <p className="text-gray-600 mb-6">
          Pick a garment and view. You can add text, shapes, images and paint on top in the editor.
        </p>
        <GarmentPicker onSelect={onSelect} />
      </main>
    </RequireAuth>
  );
}