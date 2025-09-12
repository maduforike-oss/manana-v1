import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get('q') || '').trim();
  
  if (!username) {
    return NextResponse.json({ ok: false, error: 'Missing q parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.rpc('is_username_available', { username_to_check: username });
    
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, available: Boolean(data) });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}