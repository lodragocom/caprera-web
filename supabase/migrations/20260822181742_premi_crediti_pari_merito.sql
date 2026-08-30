-- A pari merito il premio non si assegna, ne' in positivo ne' in negativo.
-- Regola: REGOLE/regole-caprera.json -> crediti.premi.parita (L0, 2026-08-22)
CREATE OR REPLACE VIEW caprera.v_premi_crediti WITH (security_invoker = on) AS
WITH r AS (
  SELECT regole FROM caprera.lega WHERE id = 'caprera'
), fp AS (
  SELECT f.stagione, f.societa, f.posizione,
    CASE WHEN count(*) OVER (PARTITION BY f.stagione, f.posizione) > 1 THEN 0::numeric
         ELSE COALESCE((((SELECT r.regole FROM r)) #>> ARRAY['crediti','premi','fantapunti', f.posizione::text])::numeric, 0::numeric)
    END AS crediti
  FROM caprera.v_classifica_fantapunti f
), mc AS (
  SELECT m.stagione, m.societa, m.posizione, m.squadre,
    CASE
      WHEN count(*) OVER (PARTITION BY m.stagione, m.posizione) > 1 THEN 0::numeric
      WHEN m.posizione = m.squadre THEN (((SELECT r.regole FROM r)) #>> ARRAY['crediti','premi','capocannoniere','ultimo'])::numeric
      WHEN m.posizione = (m.squadre - 1) THEN (((SELECT r.regole FROM r)) #>> ARRAY['crediti','premi','capocannoniere','penultimo'])::numeric
      ELSE COALESCE((((SELECT r.regole FROM r)) #>> ARRAY['crediti','premi','capocannoniere', m.posizione::text])::numeric, 0::numeric)
    END AS crediti
  FROM caprera.v_classifica_marcatori m
)
SELECT COALESCE(fp.stagione, mc.stagione) AS stagione,
       COALESCE(fp.societa, mc.societa) AS societa,
       fp.posizione AS pos_fantapunti,
       COALESCE(fp.crediti, 0::numeric) AS crediti_fantapunti,
       mc.posizione AS pos_marcatori,
       COALESCE(mc.crediti, 0::numeric) AS crediti_marcatori,
       COALESCE(fp.crediti, 0::numeric) + COALESCE(mc.crediti, 0::numeric) AS crediti_calcolati
  FROM fp
  FULL JOIN mc ON mc.stagione = fp.stagione AND mc.societa = fp.societa;
