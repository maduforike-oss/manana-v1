import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadTemplateRequest {
  categorySlug: string
  view: 'front' | 'back' | 'left' | 'right' | 'angle_left' | 'angle_right'
  colorSlug: string
  file: string // base64 encoded image
  fileName: string
  widthPx: number
  heightPx: number
  dpi?: number
  printArea?: { x: number; y: number; w: number; h: number }
  safeArea?: { x: number; y: number; w: number; h: number }
  meta?: Record<string, any>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase with service role key for privileged access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify authentication and staff status
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT token and get user ID
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user.user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is staff
    const { data: staffCheck, error: staffError } = await supabase
      .from('staff_users')
      .select('user_id')
      .eq('user_id', user.user.id)
      .single()

    if (staffError || !staffCheck) {
      console.error('Staff check error:', staffError)
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - staff access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody: UploadTemplateRequest = await req.json()
    const {
      categorySlug,
      view,
      colorSlug,
      file,
      fileName,
      widthPx,
      heightPx,
      dpi = 300,
      printArea = { x: 0, y: 0, w: 0, h: 0 },
      safeArea = { x: 0, y: 0, w: 0, h: 0 },
      meta = {}
    } = requestBody

    // Validate required fields
    if (!categorySlug || !view || !colorSlug || !file || !widthPx || !heightPx) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify category exists and get ID
    const { data: category, error: categoryError } = await supabase
      .from('garment_categories')
      .select('id, slug')
      .eq('slug', categorySlug)
      .single()

    if (categoryError || !category) {
      return new Response(
        JSON.stringify({ error: 'Invalid category slug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert base64 to file and enforce storage path convention
    const fileData = Uint8Array.from(atob(file), c => c.charCodeAt(0))
    const storagePath = `garment-templates/${categorySlug}/${colorSlug}/${view}.png`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('design-templates')
      .upload(storagePath, fileData, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for existing template with same category/view/color
    const { data: existing } = await supabase
      .from('garment_template_images')
      .select('id, storage_path')
      .eq('category_id', category.id)
      .eq('view', view)
      .eq('color_slug', colorSlug)
      .single()

    // If existing template, delete old file from storage
    if (existing) {
      await supabase.storage
        .from('design-templates')
        .remove([existing.storage_path])
    }

    // Insert or update template record
    const templateData = {
      category_id: category.id,
      view,
      color_slug: colorSlug,
      storage_path: storagePath,
      width_px: widthPx,
      height_px: heightPx,
      dpi,
      print_area: printArea,
      safe_area: safeArea,
      meta,
      created_by: user.user.id
    }

    const { data: template, error: templateError } = existing
      ? await supabase
          .from('garment_template_images')
          .update(templateData)
          .eq('id', existing.id)
          .select()
          .single()
      : await supabase
          .from('garment_template_images')
          .insert(templateData)
          .select()
          .single()

    if (templateError) {
      console.error('Template DB error:', templateError)
      // Clean up uploaded file if DB operation failed
      await supabase.storage
        .from('design-templates')
        .remove([storagePath])
        
      return new Response(
        JSON.stringify({ error: 'Failed to save template', details: templateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('design-templates')
      .getPublicUrl(storagePath)

    return new Response(
      JSON.stringify({
        success: true,
        template: {
          ...template,
          public_url: publicUrl
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})