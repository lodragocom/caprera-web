-- Quanto vale ogni bonus, in fantapunti.
--
-- La colonna `valore` c'era ed era vuota su tutte e undici le righe: il sito
-- sapeva come si chiama un bonus ma non quanto pesa, e un tabellino senza i
-- pesi non si puo' scrivere.
--
-- I valori sono quelli del regolamento (§ bonus calciatore), gli stessi con
-- cui e' stato ricalcolato l'archivio: 4.828 formazioni esatte su 4.890
-- (98,73%), e nelle ultime due stagioni tutte.
--
-- Una sola eccezione documentata non entra qui: nel 2019-20 il gol vittoria
-- valeva 0,5 invece di 1. Una colonna sola non puo' dire "tranne quell'anno",
-- e non vale la pena di una tabella per una riga: l'eccezione sta scritta
-- dove serve, in `src/lib/tabellino.js`, con il rimando al regolamento.
update caprera.bonus_tipi set valore = v.valore
from (values
  ('gol',              3.0),
  ('rigore',           3.0),
  ('rigore-parato',    3.0),
  ('assist',           1.0),
  ('imbattuto',        1.0),
  ('gol-vittoria',     1.0),
  ('giallo',          -0.5),
  ('rosso',           -1.0),
  ('gol-subito',      -1.0),
  ('autogol',         -2.0),
  ('rigore-sbagliato', -3.0)
) as v(id, valore)
where bonus_tipi.id = v.id;
