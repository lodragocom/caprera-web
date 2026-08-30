-- La chiave vecchia era rimasta: non conosce il momento, e quindi vieta di
-- avere per la stessa stagione la quotazione di partenza e quella di fine.
-- E' esattamente ciò che la migrazione precedente voleva permettere. Si
-- toglie: `listone_chiave_idx`, che il momento ce l'ha, fa gia' il suo lavoro.
drop index if exists caprera.listone_una_riga_sola;
