-- Printify Products Catalog
CREATE TABLE IF NOT EXISTS public.printify_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  model TEXT,
  print_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mapping between Manana garments and Printify products
CREATE TABLE IF NOT EXISTS public.printify_garment_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_id UUID REFERENCES public.garments(id) ON DELETE CASCADE,
  printify_blueprint_id TEXT NOT NULL,
  print_provider_id INTEGER NOT NULL,
  zone_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(garment_id, printify_blueprint_id, print_provider_id)
);

-- Uploaded design files to Printify
CREATE TABLE IF NOT EXISTS public.printify_design_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.design_documents(id) ON DELETE SET NULL,
  printify_image_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  width_px INTEGER NOT NULL,
  height_px INTEGER NOT NULL,
  dpi INTEGER DEFAULT 300,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.printify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printify_garment_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printify_design_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Printify products are publicly readable"
  ON public.printify_products FOR SELECT
  USING (true);

CREATE POLICY "Printify garment mappings are publicly readable"
  ON public.printify_garment_mapping FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own design files"
  ON public.printify_design_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own design files"
  ON public.printify_design_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_printify_products_blueprint ON public.printify_products(blueprint_id);
CREATE INDEX idx_printify_garment_mapping_garment ON public.printify_garment_mapping(garment_id);
CREATE INDEX idx_printify_design_files_user ON public.printify_design_files(user_id);
CREATE INDEX idx_printify_design_files_design ON public.printify_design_files(design_id);

-- Updated timestamp trigger
CREATE TRIGGER update_printify_products_updated_at
  BEFORE UPDATE ON public.printify_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();