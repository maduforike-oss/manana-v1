import { supabase } from '@/integrations/supabase/client'

/**
 * Check if the current user has staff privileges
 */
export async function isStaff(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('staff_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error checking staff status:', error)
    return false
  }
}