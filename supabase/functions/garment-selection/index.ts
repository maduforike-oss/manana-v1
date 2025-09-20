import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface GarmentAPIResponse {
  garments?: any[];
  garment?: any;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Extract slug if provided: /garment-selection/hoodie -> slug = "hoodie"
    const slug = pathSegments.length > 1 ? pathSegments[1] : null;

    if (slug) {
      // Get specific garment details
      console.log(`Fetching garment details for slug: ${slug}`);
      
      // Get category
      const { data: category, error: categoryError } = await supabase
        .from('garment_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (categoryError || !category) {
        console.error('Category error:', categoryError);
        return new Response(
          JSON.stringify({ error: `Garment type "${slug}" not found` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get template images for this category
      const { data: templates, error: templatesError } = await supabase
        .from('garment_template_images')
        .select('*')
        .eq('category_id', category.id);

      if (templatesError) {
        console.error('Templates error:', templatesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch templates' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Transform to API format
      const views: Record<string, any> = {};
      const colors = new Set<string>();
      
      templates?.forEach(template => {
        const publicUrl = supabase.storage
          .from('design-templates')
          .getPublicUrl(template.storage_path).data.publicUrl;

        views[template.view] = {
          url: publicUrl,
          width_px: template.width_px,
          height_px: template.height_px,
          dpi: template.dpi,
          print_area: template.print_area,
          safe_area: template.safe_area,
          color: template.color_slug,
          storage_path: template.storage_path
        };
        
        colors.add(template.color_slug);
      });

      const garment = {
        slug: category.slug,
        name: category.name,
        category: category.slug,
        views,
        colors: Array.from(colors),
        default_color: 'white',
        template_count: templates?.length || 0
      };

      console.log(`Returning garment data for ${slug}:`, JSON.stringify(garment, null, 2));

      return new Response(
        JSON.stringify({ garment }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Get all garments
      console.log('Fetching all garments');
      
      const { data: categories, error: categoriesError } = await supabase
        .from('garment_categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Categories error:', categoriesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch garment categories' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const garments = [];

      for (const category of categories || []) {
        // Get template count for this category
        const { count } = await supabase
          .from('garment_template_images')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        // Get sample template for preview
        const { data: sampleTemplate } = await supabase
          .from('garment_template_images')
          .select('*')
          .eq('category_id', category.id)
          .eq('view', 'front')
          .limit(1)
          .single();

        let preview_url = null;
        if (sampleTemplate) {
          preview_url = supabase.storage
            .from('design-templates')
            .getPublicUrl(sampleTemplate.storage_path).data.publicUrl;
        }

        garments.push({
          slug: category.slug,
          name: category.name,
          category: category.slug,
          template_count: count || 0,
          preview_url,
          created_at: category.created_at
        });
      }

      console.log(`Returning ${garments.length} garments`);

      return new Response(
        JSON.stringify({ garments }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in garment-selection function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});