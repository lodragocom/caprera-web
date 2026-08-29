-- Add missing columns to squadre table
ALTER TABLE public.squadre ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.squadre ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES public.leagues(id);
ALTER TABLE public.squadre ADD COLUMN IF NOT EXISTS season text DEFAULT '25/26';
