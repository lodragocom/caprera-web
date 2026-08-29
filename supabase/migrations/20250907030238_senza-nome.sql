-- Create functions for player actions

-- Function to sell a player
CREATE OR REPLACE FUNCTION public.vendi_giocatore(p_rosa_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_costo_acquisto integer;
  v_squadra text;
BEGIN
  -- Get player cost and team
  SELECT costo_acquisto, squadra 
  INTO v_costo_acquisto, v_squadra
  FROM public.rose 
  WHERE id = p_rosa_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found in roster with id %', p_rosa_id;
  END IF;
  
  -- Update player status to sold
  UPDATE public.rose
  SET stato = 'venduto'
  WHERE id = p_rosa_id;
  
  -- Return credits to team
  UPDATE public.squadre
  SET crediti = crediti + v_costo_acquisto
  WHERE nome = v_squadra;
  
  RAISE NOTICE 'Player % sold, % credits returned to %', p_rosa_id, v_costo_acquisto, v_squadra;
END;
$$;

-- Function to trade a player
CREATE OR REPLACE FUNCTION public.scambia_giocatore(p_rosa_id integer, p_nuova_squadra text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update player's team
  UPDATE public.rose
  SET squadra = p_nuova_squadra
  WHERE id = p_rosa_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found in roster with id %', p_rosa_id;
  END IF;
  
  RAISE NOTICE 'Player % traded to %', p_rosa_id, p_nuova_squadra;
END;
$$;

-- Function to put player back in auction
CREATE OR REPLACE FUNCTION public.rimetti_in_asta(p_rosa_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_costo_acquisto integer;
  v_squadra text;
BEGIN
  -- Get player cost and team
  SELECT costo_acquisto, squadra 
  INTO v_costo_acquisto, v_squadra
  FROM public.rose 
  WHERE id = p_rosa_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found in roster with id %', p_rosa_id;
  END IF;
  
  -- Update player status to auction
  UPDATE public.rose
  SET stato = 'in_asta'
  WHERE id = p_rosa_id;
  
  -- Return credits to team
  UPDATE public.squadre
  SET crediti = crediti + v_costo_acquisto
  WHERE nome = v_squadra;
  
  RAISE NOTICE 'Player % put back in auction, % credits returned to %', p_rosa_id, v_costo_acquisto, v_squadra;
END;
$$;
