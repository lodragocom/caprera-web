-- I «crediti non spesi» non si calcolano: si copiano.
--
-- `residui` era iniziali - spesi + scambi, e contro la colonna di Guido
-- sbagliava NOVE societa' su dieci nel 2025-26: il foglio dice fra 0 e 9,
-- il calcolo arrivava a 31. Non sono due misure della stessa cosa a cui manca
-- un pezzo, sono grandezze di ordine diverso - fra l'asta di settembre e la
-- fine dell'anno passano acquisti a mercato aperto e rimborsi da svincolo che
-- `spesi` (che e' esattamente la somma della rosa di settembre) non contiene.
--
-- La prova che il numero di Guido e' quello buono e' che il database ne
-- conserva gia' la meta': ceil(non_spesi/2) e' il `riportati` dell'anno dopo,
-- dieci su dieci, verificato. Un'identita' che torna 10/10 puo' anche voler
-- dire che il numero non si calcola - si copia.
alter table caprera.finanze add column if not exists assicurazione integer;

comment on column caprera.finanze.residui is
 'I «crediti non spesi» a fine stagione, letti dal foglio Pagamenti/Vincite/Crediti di Guido. NON si ricalcola da iniziali - spesi: fra i due passano il mercato di gennaio e i rimborsi da svincolo, e il calcolo sbagliava 9 societa su 10 nel 2025-26. Da qui esce il riportati dell''anno dopo, con ceil(residui/2).';
comment on column caprera.finanze.assicurazione is
 'L''assicurazione obbligatoria, negativa, applicata dopo il totale delle vincite. Il foglio la tiene fuori dalle vincite e cosi la teniamo qui: iniziali = 250 + riportati + bonus + ffp + coalesce(assicurazione,0).';

-- 1. i dieci non spesi del 2025-26
update caprera.finanze f set residui = v.n
  from (values ('armata-rossa',9),('aston-ville',9),('disperata',2),('prosecco',2),
               ('real-monghi',5),('roburro',0),('sanguemisto',2),('smit',1),
               ('sporting-mangiapreti',7),('subbuteo',1)) as v(societa,n)
 where f.stagione='2025-26' and f.societa=v.societa;

-- 2. lo Smit: l'assicurazione da -5 non era mai stata sottratta dagli iniziali.
--    Con 252 al posto di 257 il conto torna da solo: 252 - 251 speso = 1 non
--    speso, che e' esattamente quello che dice Guido.
update caprera.finanze set iniziali = 252, assicurazione = -5
 where stagione='2025-26' and societa='smit';
