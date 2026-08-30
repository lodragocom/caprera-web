-- Create formazioni table for tactical formations and lineups
CREATE TABLE IF NOT EXISTS public.formazioni (
  id SERIAL PRIMARY KEY,
  squadra TEXT NOT NULL,
  stagione TEXT DEFAULT '25/26',
  modulo TEXT DEFAULT '4-3-3',
  titolari JSONB DEFAULT '{}',
  panchina JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.formazioni ENABLE ROW LEVEL SECURITY;

-- Create policies for formazioni
CREATE POLICY "Teams can view their own formations" 
ON public.formazioni 
FOR SELECT 
USING (true);

CREATE POLICY "Teams can insert their own formations" 
ON public.formazioni 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teams can update their own formations" 
ON public.formazioni 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_formazioni_updated_at
BEFORE UPDATE ON public.formazioni
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
