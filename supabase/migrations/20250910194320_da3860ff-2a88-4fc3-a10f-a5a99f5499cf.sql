-- Extend profiles table with additional fields
DO $$ 
BEGIN
  -- Add new columns to profiles table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
    ALTER TABLE public.profiles ADD COLUMN display_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE public.profiles ADD COLUMN location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE public.profiles ADD COLUMN website text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_instagram') THEN
    ALTER TABLE public.profiles ADD COLUMN social_instagram text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_twitter') THEN
    ALTER TABLE public.profiles ADD COLUMN social_twitter text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_url') THEN
    ALTER TABLE public.profiles ADD COLUMN cover_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create unique case-insensitive username constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_username_unique_idx') THEN
    CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles (lower(username)) WHERE username IS NOT NULL;
  END IF;
END $$;

-- Create profile_metrics table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_metrics') THEN
    CREATE TABLE public.profile_metrics (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      total_designs integer DEFAULT 0,
      followers integer DEFAULT 0,
      following integer DEFAULT 0,
      updated_at timestamp with time zone DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on profile_metrics
ALTER TABLE public.profile_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_metrics
DO $$
BEGIN
  -- Policy for reading profile metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_metrics' AND policyname = 'Profile metrics are viewable by logged-in users') THEN
    CREATE POLICY "Profile metrics are viewable by logged-in users" 
    ON public.profile_metrics 
    FOR SELECT 
    USING (true);
  END IF;
  
  -- Policy for updating own profile metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_metrics' AND policyname = 'Users can update their own profile metrics') THEN
    CREATE POLICY "Users can update their own profile metrics" 
    ON public.profile_metrics 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  -- Policy for inserting own profile metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_metrics' AND policyname = 'Users can insert their own profile metrics') THEN
    CREATE POLICY "Users can insert their own profile metrics" 
    ON public.profile_metrics 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create username availability RPC function
CREATE OR REPLACE FUNCTION public.is_username_available(username_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE lower(username) = lower(username_to_check)
    AND id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );
$$;

-- Create storage bucket for design assets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'design-assets') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('design-assets', 'design-assets', true);
  END IF;
END $$;

-- Create storage policies for design-assets bucket
DO $$
BEGIN
  -- Policy for public access to view avatars/covers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public can view design assets') THEN
    CREATE POLICY "Public can view design assets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'design-assets');
  END IF;
  
  -- Policy for authenticated users to upload their own assets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload their own design assets') THEN
    CREATE POLICY "Authenticated users can upload their own design assets"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'design-assets' 
      AND auth.role() = 'authenticated'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
  
  -- Policy for users to update their own assets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can update their own design assets') THEN
    CREATE POLICY "Users can update their own design assets"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'design-assets' 
      AND auth.role() = 'authenticated'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
  
  -- Policy for users to delete their own assets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete their own design assets') THEN
    CREATE POLICY "Users can delete their own design assets"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'design-assets' 
      AND auth.role() = 'authenticated'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Update the existing user creation trigger to also create profile metrics
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  -- Create profile entry
  INSERT INTO public.profiles (id) VALUES (new.id);
  
  -- Create profile metrics entry
  INSERT INTO public.profile_metrics (user_id) VALUES (new.id);
  
  RETURN new;
END;
$$;