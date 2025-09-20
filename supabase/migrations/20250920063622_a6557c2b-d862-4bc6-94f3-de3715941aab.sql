-- Create design_documents table for saving user designs
CREATE TABLE public.design_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Design',
  garment_type TEXT NOT NULL,
  garment_slug TEXT,
  canvas_config JSONB NOT NULL DEFAULT '{}',
  design_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own designs" 
ON public.design_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs" 
ON public.design_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" 
ON public.design_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" 
ON public.design_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_design_documents_updated_at
BEFORE UPDATE ON public.design_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();