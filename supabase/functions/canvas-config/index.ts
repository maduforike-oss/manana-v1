import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const garmentType = url.searchParams.get('garmentType');

    if (!garmentType) {
      return new Response(
        JSON.stringify({ error: 'garmentType parameter is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query garment template images for the specified garment type
    const { data: templates, error } = await supabase
      .from('garment_template_images')
      .select(`
        *,
        category:garment_categories(*)
      `)
      .eq('category.slug', garmentType)
      .eq('view', 'front')
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch garment template' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!templates || templates.length === 0) {
      // Return default canvas config if no template found
      const defaultConfig = {
        width: 4500,
        height: 5400,
        dpi: 300,
        background: 'transparent',
        showGrid: true,
        gridSize: 50,
        showRulers: true,
        showGuides: true,
        safeAreaPct: 10,
        bleedMm: 3,
        unit: 'px'
      };

      return new Response(
        JSON.stringify({ canvasConfig: defaultConfig }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const template = templates[0];
    
    // Build canvas config from template data
    const canvasConfig = {
      width: template.width_px || 4500,
      height: template.height_px || 5400,
      dpi: template.dpi || 300,
      background: 'transparent',
      showGrid: true,
      gridSize: 50,
      showRulers: true,
      showGuides: true,
      safeAreaPct: 10,
      bleedMm: 3,
      unit: 'px',
      // Include print and safe areas from template
      printArea: template.print_area || { x: 0, y: 0, w: 0, h: 0 },
      safeArea: template.safe_area || { x: 0, y: 0, w: 0, h: 0 },
      templateUrl: template.storage_path ? 
        `${supabaseUrl}/storage/v1/object/public/design-templates/${template.storage_path}` : 
        null
    };

    return new Response(
      JSON.stringify({ canvasConfig }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Canvas config error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});