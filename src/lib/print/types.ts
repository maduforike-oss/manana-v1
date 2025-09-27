export interface PrintPreset {
  id: string;
  name: string;
  width_in: number;
  height_in: number;
  dpi: number;
  bleed_in: number;
  created_at?: string;
  created_by?: string;
}

export interface PrintZone {
  garment_key: string;
  side: 'front' | 'back' | 'left_sleeve' | 'right_sleeve' | 'hood' | 'pocket';
  mask_path?: string;
  printable_rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  updated_at?: string;
}

export interface ExportRequest {
  width_px: number;
  height_px: number;
  dpi: number;
  format: 'png' | 'pdf' | 'svg';
  transparent?: boolean;
  color_profile?: string;
  include_bleed?: boolean;
}

export interface ExportResult {
  id: string;
  user_id: string;
  design_id?: string;
  preset_id?: string;
  format: string;
  width_px: number;
  height_px: number;
  dpi: number;
  color_profile: string;
  storage_path: string;
  created_at: string;
}

export interface ColorInfo {
  rgb: [number, number, number];
  hex: string;
  name?: string;
  pantone?: string;
  isOutOfGamut?: boolean;
}

export interface BlendMode {
  name: string;
  value: 'normal' | 'multiply' | 'screen' | 'overlay';
  printSafe: boolean;
}