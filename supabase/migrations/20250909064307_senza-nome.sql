-- Create upsert_formazione RPC function
CREATE OR REPLACE FUNCTION public.upsert_formazione(
  p_squadra text,
  p_stagione text,
  p_modulo text,
  p_titolari jsonb,
  p_panchina jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.formazioni (squadra, stagione, modulo, titolari, panchina, updated_at)
  VALUES (p_squadra, p_stagione, p_modulo, p_titolari, p_panchina, now())
  ON CONFLICT (squadra, stagione)
  DO UPDATE SET
    modulo = EXCLUDED.modulo,
    titolari = EXCLUDED.titolari,
    panchina = EXCLUDED.panchina,
    updated_at = now();
END;
$$;
