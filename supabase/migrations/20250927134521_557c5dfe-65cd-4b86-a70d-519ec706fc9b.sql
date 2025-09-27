-- Phase 1: Database Setup for Print-Ready Tools (Fixed Syntax)
-- Create tables for print presets, garment zones, and export history

-- Print presets table for common print dimensions and settings
CREATE TABLE IF NOT EXISTS public.print_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  width_in decimal NOT NULL,
  height_in decimal NOT NULL,
  dpi integer DEFAULT 300,
  bleed_in decimal DEFAULT 0.125,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Garment print zones for each garment side (front, back, sleeves, etc.)
CREATE TABLE IF NOT EXISTS public.garment_print_zones (
  garment_key text NOT NULL,
  side text NOT NULL CHECK (side IN ('front', 'back', 'left_sleeve', 'right_sleeve', 'hood', 'pocket')),
  mask_path text,
  printable_rect jsonb NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 0, "height": 0}',
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (garment_key, side)
);

-- Design exports history
CREATE TABLE IF NOT EXISTS public.design_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  design_id uuid,
  preset_id uuid REFERENCES public.print_presets(id),
  format text CHECK (format IN ('png', 'pdf', 'svg')),
  width_px integer,
  height_px integer,
  dpi integer,
  color_profile text DEFAULT 'sRGB',
  storage_path text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.print_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garment_print_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for print_presets
DROP POLICY IF EXISTS "print_presets_public_read" ON public.print_presets;
CREATE POLICY "print_presets_public_read" ON public.print_presets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "print_presets_auth_write" ON public.print_presets;
CREATE POLICY "print_presets_auth_write" ON public.print_presets
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for garment_print_zones
DROP POLICY IF EXISTS "garment_zones_public_read" ON public.garment_print_zones;
CREATE POLICY "garment_zones_public_read" ON public.garment_print_zones
  FOR SELECT USING (true);

-- RLS Policies for design_exports
DROP POLICY IF EXISTS "design_exports_owner_read" ON public.design_exports;
CREATE POLICY "design_exports_owner_read" ON public.design_exports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "design_exports_owner_write" ON public.design_exports;
CREATE POLICY "design_exports_owner_write" ON public.design_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);