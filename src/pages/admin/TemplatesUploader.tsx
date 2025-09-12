import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCategories, upsertTemplateImage, publicUrl } from '@/lib/garmentTemplates';
import { supabase } from '@/integrations/supabase/client';
import { isStaff } from '@/lib/auth';
import { DEFAULT_COLORS } from '@/lib/garmentColors';

type View = 'front'|'back';

export default function TemplatesUploader() {
  const nav = useNavigate();
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<{id:string;slug:string;name:string}[]>([]);
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [color, setColor] = useState<string>('white');
  const [view, setView] = useState<View>('front');

  const [file, setFile] = useState<File | null>(null);
  const [imageDims, setImageDims] = useState<{w:number;h:number}|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const ok = await isStaff();
      setAllowed(ok);
      setLoading(false);
      if (!ok) setTimeout(() => nav('/'), 1500);
    })();
  }, [nav]);

  useEffect(() => {
    (async () => {
      const cats = await listCategories();
      setCategories(cats);
      if (!categorySlug && cats.length) setCategorySlug(cats[0].slug);
    })();
  }, [categorySlug]);

  // read image dims on file select
  useEffect(() => {
    if (!file) {
      setImageDims(null);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  const canSubmit = useMemo(() =>
    !!file && !!categorySlug && !!color && !!view && !!imageDims, [file, categorySlug, color, view, imageDims]
  );

  const storagePath = useMemo(() => {
    if (!categorySlug || !color || !view || !file) return '';
    const ext = file.name.toLowerCase().endsWith('.png') ? 'png' : file.name.split('.').pop() || 'png';
    return `garment-templates/${categorySlug}/${color}/${view}.${ext}`;
  }, [categorySlug, color, view, file]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !file || !imageDims) return;
    try {
      setSubmitting(true);
      // 1) Upload to storage
      const { error: upErr } = await supabase
        .storage
        .from('design-templates')
        .upload(storagePath, file, { upsert: true, contentType: 'image/png' });

      if (upErr) throw upErr;

      // 2) Upsert metadata via Edge Function
      const res = await upsertTemplateImage({
        category_slug: categorySlug,
        view,
        color_slug: color,
        storage_path: storagePath,
        width_px: imageDims.w,
        height_px: imageDims.h,
        dpi: 300
      });

      // 3) Show final public URL
      setResultUrl(publicUrl(storagePath));
      alert('Template uploaded & indexed ✔');
    } catch (err:any) {
      console.error(err);
      alert(`Upload failed: ${err?.message ?? String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!allowed) return <div className="p-6">Not authorized. Redirecting…</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin • Templates Uploader</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <div className="text-sm font-medium mb-1">Category</div>
            <select className="w-full border rounded px-3 py-2"
              value={categorySlug}
              onChange={(e)=>setCategorySlug(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">Color</div>
            <select className="w-full border rounded px-3 py-2"
              value={color}
              onChange={(e)=>setColor(e.target.value)}>
              {DEFAULT_COLORS.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-medium mb-1">View</div>
            <select className="w-full border rounded px-3 py-2"
              value={view}
              onChange={(e)=>setView(e.target.value as View)}>
              <option value="front">front</option>
              <option value="back">back</option>
            </select>
          </label>
        </div>

        <div
          onDragOver={(e)=>e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-xl p-6 text-center"
        >
          <p className="mb-2">Drag & drop PNG here (recommended 2400×3000px) or choose file</p>
          <input type="file" accept="image/png,image/webp,image/jpeg" onChange={handleFileInput} />
          {file && (
            <div className="mt-3 text-sm">
              Selected: <strong>{file.name}</strong>{imageDims ? ` • ${imageDims.w}×${imageDims.h}px` : ''}
            </div>
          )}
        </div>

        <div className="text-sm bg-gray-50 border rounded p-3">
          <div><b>Bucket:</b> design-templates</div>
          <div><b>Path:</b> {storagePath || '(select options and file)'}</div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Uploading…' : 'Upload & Save'}
        </button>

        {resultUrl && (
          <div className="mt-4 text-sm">
            <div className="mb-1"><b>Public URL</b></div>
            <a href={resultUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{resultUrl}</a>
            <div className="text-xs text-gray-500 mt-1">Use this in Market/PDP via <code>publicUrl(storage_path)</code>.</div>
          </div>
        )}
      </form>
    </main>
  );
}