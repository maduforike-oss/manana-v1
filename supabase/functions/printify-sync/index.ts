import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyApiKey = Deno.env.get('PRINTIFY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!printifyApiKey) {
      throw new Error('PRINTIFY_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Printify Sync] Starting catalog sync...');

    // Fetch blueprints from Printify
    const blueprintsResponse = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints.json`, {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
      },
    });

    if (!blueprintsResponse.ok) {
      throw new Error(`Failed to fetch blueprints: ${blueprintsResponse.status}`);
    }

    const blueprintsData = await blueprintsResponse.json();
    console.log(`[Printify Sync] Found ${blueprintsData.length} blueprints`);

    let syncedCount = 0;
    let errorCount = 0;

    // Sync each blueprint
    for (const blueprint of blueprintsData) {
      try {
        // Fetch detailed blueprint info including print providers
        const detailResponse = await fetch(
          `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprint.id}.json`,
          {
            headers: {
              'Authorization': `Bearer ${printifyApiKey}`,
            },
          }
        );

        if (!detailResponse.ok) {
          console.error(`[Printify Sync] Failed to fetch blueprint ${blueprint.id}`);
          errorCount++;
          continue;
        }

        const detailData = await detailResponse.json();

        // Extract print areas from the blueprint
        const printAreas = detailData.print_areas || [];

        // Upsert into database
        const { error } = await supabase
          .from('printify_products')
          .upsert({
            blueprint_id: blueprint.id.toString(),
            title: blueprint.title,
            description: blueprint.description || '',
            brand: blueprint.brand || '',
            model: blueprint.model || '',
            print_areas: printAreas,
            variants: detailData.variants || [],
            images: detailData.images || [],
            tags: blueprint.tags || [],
            is_active: true,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'blueprint_id',
          });

        if (error) {
          console.error(`[Printify Sync] Error upserting blueprint ${blueprint.id}:`, error);
          errorCount++;
        } else {
          syncedCount++;
          console.log(`[Printify Sync] Synced blueprint: ${blueprint.title}`);
        }

        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[Printify Sync] Error processing blueprint ${blueprint.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[Printify Sync] Complete. Synced: ${syncedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      synced: syncedCount,
      errors: errorCount,
      total: blueprintsData.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Printify Sync Error]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
