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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, password, adminSecret } = await req.json();

    // Verify admin secret
    const expectedSecret = Deno.env.get('ADMIN_SECRET_KEY');
    if (!adminSecret || adminSecret !== expectedSecret) {
      console.error('Invalid admin secret provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid admin secret' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Setting password for email: ${email}`);

    // Find the user by email
    const { data: users, error: fetchError } = await supabaseClient.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Password successfully updated for user: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Password updated successfully for ${email}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in set-user-password function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});