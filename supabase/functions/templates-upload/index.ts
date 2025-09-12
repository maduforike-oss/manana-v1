// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
    const body = await req.json()

    const {
      category_slug,
      view,
      color_slug = 'white',
      storage_path,
      width_px,
      height_px,
      dpi = 300,
      print_area = { x:0, y:0, w:0, h:0 },
      safe_area  = { x:0, y:0, w:0, h:0 }
    } = body

    if (!category_slug || !view || !storage_path || !width_px || !height_px) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: cat, error: catErr } = await supabase
      .from('garment_categories').select('id').eq('slug', category_slug).maybeSingle()

    if (catErr || !cat?.id) {
      return new Response(JSON.stringify({ error: 'Unknown category_slug' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data, error } = await supabase
      .from('garment_template_images')
      .upsert({
        category_id: cat.id,
        view,
        color_slug,
        storage_path,
        width_px,
        height_px,
        dpi,
        print_area,
        safe_area
      }, { onConflict: 'category_id,view,color_slug' })
      .select('*')
      .maybeSingle()

    if (error) throw error

    return new Response(JSON.stringify({ image: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})