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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const designId = pathParts[pathParts.length - 1];

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    switch (req.method) {
      case 'GET':
        if (designId && designId !== 'design-persistence') {
          // Get specific design
          const { data: design, error } = await supabase
            .from('design_documents')
            .select('*')
            .eq('id', designId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: 'Design not found' }), 
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ design }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else {
          // List user designs
          const { data: designs, error } = await supabase
            .from('design_documents')
            .select('id, title, garment_type, garment_slug, thumbnail_url, created_at, updated_at')
            .order('updated_at', { ascending: false });

          if (error) {
            return new Response(
              JSON.stringify({ error: 'Failed to fetch designs' }), 
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ designs: designs || [] }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

      case 'POST':
        // Create new design
        const createData = await req.json();
        
        const { data: newDesign, error: createError } = await supabase
          .from('design_documents')
          .insert({
            title: createData.title || 'Untitled Design',
            garment_type: createData.garment_type || 'tshirt',
            garment_slug: createData.garment_slug,
            canvas_config: createData.canvas_config || {},
            design_data: createData.design_data || {},
            thumbnail_url: createData.thumbnail_url
          })
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create design' }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ design: newDesign }), 
          { 
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'PUT':
        // Update existing design
        const updateData = await req.json();
        
        const { data: updatedDesign, error: updateError } = await supabase
          .from('design_documents')
          .update({
            title: updateData.title,
            canvas_config: updateData.canvas_config,
            design_data: updateData.design_data,
            thumbnail_url: updateData.thumbnail_url
          })
          .eq('id', designId)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update design' }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ design: updatedDesign }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'DELETE':
        // Delete design
        const { error: deleteError } = await supabase
          .from('design_documents')
          .delete()
          .eq('id', designId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete design' }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }), 
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Design persistence error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});