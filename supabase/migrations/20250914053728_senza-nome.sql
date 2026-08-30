-- Drop existing function and recreate it
DROP FUNCTION IF EXISTS public.create_team(text, integer, text, uuid);

-- Create function for creating a team
CREATE OR REPLACE FUNCTION public.create_team(
  p_nome text,
  p_crediti integer DEFAULT 250,
  p_stagione text DEFAULT '25/26',
  p_owner uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if team already exists
  IF EXISTS (SELECT 1 FROM public.squadre WHERE nome = p_nome AND stagione = p_stagione) THEN
    RAISE EXCEPTION 'Una squadra con nome % già esiste per la stagione %', p_nome, p_stagione;
  END IF;

  -- Insert new team
  INSERT INTO public.squadre (nome, crediti, stagione, owner_user_id)
  VALUES (p_nome, p_crediti, p_stagione, p_owner);
END;
$$;

-- Create function for assigning team to user  
CREATE OR REPLACE FUNCTION public.assign_team_to_user(
  p_squadra text,
  p_user uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if team exists
  IF NOT EXISTS (SELECT 1 FROM public.squadre WHERE nome = p_squadra AND stagione = '25/26') THEN
    RAISE EXCEPTION 'Squadra % non trovata per la stagione 25/26', p_squadra;
  END IF;

  -- Update team owner
  UPDATE public.squadre
  SET owner_user_id = p_user
  WHERE nome = p_squadra AND stagione = '25/26';

  -- If user has a profile, update display_name to team name
  UPDATE public.profiles
  SET display_name = p_squadra
  WHERE user_id = p_user;
  
  -- If profile doesn't exist, create it
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (p_user, p_squadra)
  ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name;
END;
$$;
