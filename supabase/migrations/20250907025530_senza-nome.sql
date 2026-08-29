-- Drop existing function and create new one
DROP FUNCTION IF EXISTS public.add_to_rosa(text,bigint,text,integer,integer,integer);

-- Create function to add player to rosa
CREATE OR REPLACE FUNCTION public.add_to_rosa(
  p_squadra text,
  p_player_id bigint,
  p_stagione text,
  p_costo_acquisto integer,
  p_contratto integer DEFAULT NULL,
  p_clausola_recissoria integer DEFAULT NULL
) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert player into rosa
  INSERT INTO public.rose (
    squadra,
    player_id,
    stagione,
    costo_acquisto,
    contratto,
    clausola_recissoria,
    stato,
    data_inserimento
  ) VALUES (
    p_squadra,
    p_player_id,
    p_stagione,
    p_costo_acquisto,
    p_contratto,
    p_clausola_recissoria,
    'attivo',
    now()
  );

  -- Update team credits
  UPDATE public.squadre
  SET crediti = crediti - p_costo_acquisto
  WHERE nome = p_squadra
    AND stagione = p_stagione;
    
  -- Log the operation
  RAISE NOTICE 'Player % added to team % for %M', p_player_id, p_squadra, p_costo_acquisto;
END;
$$;
