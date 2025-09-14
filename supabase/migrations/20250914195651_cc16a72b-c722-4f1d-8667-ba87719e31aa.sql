-- Enable RLS on staff_users table to fix security linting issue
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Add policy for staff_users (only viewable by staff themselves)
CREATE POLICY "Staff users can view staff table" 
ON public.staff_users FOR SELECT 
USING (user_id = auth.uid());