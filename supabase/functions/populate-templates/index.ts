import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TemplateFile {
  name: string;
  garmentType: string;
  view: string;
  color: string;
  storagePath: string;
}

function parseFileName(fileName: string): TemplateFile | null {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  // Parse patterns like "White Hoodie Front_", "Black T-Shirt Back", etc.
  const patterns = [
    /^(\w+)\s+(.*?)\s+(Front|Back|Side)_?$/i,
    /^(.*?)\s+(Front|Back|Side)\s*(\w+)?$/i,
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const [, part1, part2, part3] = match;
      
      // Determine which part is color, garment, and view
      let color = 'white';
      let garmentType = '';
      let view = '';
      
      if (part3 && ['Front', 'Back', 'Side'].includes(part3)) {
        view = part3.toLowerCase();
        if (['White', 'Black', 'Gray', 'Navy', 'Red'].includes(part1)) {
          color = part1.toLowerCase();
          garmentType = part2.toLowerCase().replace(/\s+/g, '-');
        } else {
          garmentType = `${part1} ${part2}`.toLowerCase().replace(/\s+/g, '-');
        }
      } else if (['Front', 'Back', 'Side'].includes(part2)) {
        view = part2.toLowerCase();
        garmentType = part1.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Map common garment names to category slugs
      const garmentMappings: Record<string, string> = {
        'hoodie': 'hooded-pullover-hoodie',
        'hooded-pullover-hoodie': 'hooded-pullover-hoodie',
        't-shirt': 'oversized-tee',
        'tshirt': 'oversized-tee',
        'tee': 'oversized-tee',
        'polo': 'polo-shirt',
        'polo-shirt': 'polo-shirt',
        'long-sleeve': 'long-sleeve-tee',
        'longsleeve': 'long-sleeve-tee',
        'crewneck': 'cropped-sweatshirt',
        'zip-hoodie': 'zip-up-hoodie',
        'zip-up-hoodie': 'zip-up-hoodie',
      };
      
      const mappedGarment = garmentMappings[garmentType] || garmentType;
      
      return {
        name: fileName,
        garmentType: mappedGarment,
        view,
        color,
        storagePath: fileName
      };
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting template population process...');

    // 1. List all files in design-templates bucket
    const { data: files, error: listError } = await supabase.storage
      .from('design-templates')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      throw listError;
    }

    console.log(`Found ${files?.length || 0} files in design-templates bucket`);

    // 2. Get existing garment categories
    const { data: categories, error: categoriesError } = await supabase
      .from('garment_categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));
    console.log('Available categories:', categories.map(c => c.slug));

    // 3. Process each file
    const templates = [];
    let processed = 0;
    let skipped = 0;

    for (const file of files || []) {
      if (!file.name.match(/\.(png|jpg|jpeg)$/i)) {
        skipped++;
        continue;
      }

      const parsed = parseFileName(file.name);
      if (!parsed) {
        console.log(`Could not parse file: ${file.name}`);
        skipped++;
        continue;
      }

      const categoryId = categoryMap.get(parsed.garmentType);
      if (!categoryId) {
        console.log(`No category found for garment type: ${parsed.garmentType} (file: ${file.name})`);
        skipped++;
        continue;
      }

      // Get file metadata for dimensions (estimate based on common sizes)
      const estimatedDimensions = {
        width_px: 2400,
        height_px: 3000,
        dpi: 300
      };

      // Calculate print and safe areas (typical garment dimensions)
      const printArea = {
        x: Math.round(estimatedDimensions.width_px * 0.25),
        y: Math.round(estimatedDimensions.height_px * 0.3),
        w: Math.round(estimatedDimensions.width_px * 0.5),
        h: Math.round(estimatedDimensions.height_px * 0.4)
      };

      const safeArea = {
        x: printArea.x + 20,
        y: printArea.y + 20,
        w: printArea.w - 40,
        h: printArea.h - 40
      };

      templates.push({
        category_id: categoryId,
        view: parsed.view,
        color_slug: parsed.color,
        width_px: estimatedDimensions.width_px,
        height_px: estimatedDimensions.height_px,
        dpi: estimatedDimensions.dpi,
        print_area: printArea,
        safe_area: safeArea,
        storage_path: file.name,
        meta: {
          original_name: file.name,
          parsed_garment: parsed.garmentType,
          auto_populated: true,
          populated_at: new Date().toISOString()
        }
      });

      processed++;
    }

    console.log(`Processed: ${processed}, Skipped: ${skipped}`);

    // 4. Insert templates into database
    if (templates.length > 0) {
      const { data: insertedTemplates, error: insertError } = await supabase
        .from('garment_template_images')
        .insert(templates)
        .select();

      if (insertError) {
        console.error('Error inserting templates:', insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${insertedTemplates?.length || 0} templates`);
    }

    return new Response(JSON.stringify({
      success: true,
      processed,
      skipped,
      inserted: templates.length,
      templates: templates.slice(0, 5) // Show first 5 as sample
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in populate-templates function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});