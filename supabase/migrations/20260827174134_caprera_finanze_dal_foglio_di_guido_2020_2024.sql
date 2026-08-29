-- Quattro stagioni di bilanci, lette dal foglio Pagamenti/Vincite/Crediti.
--
-- Ogni scheda «Vincite <stagione>» ha lo stesso blocco: crediti non spesi,
-- carry-over al 50%, vincite, totale, e i crediti della stagione dopo. Non si
-- deduce niente: si copia. Due controlli prima di scrivere, tutti e due passati:
--
--   carry = ceil(non_spesi / 2)        50 righe su 50, cinque stagioni x dieci
--   base + riportati + bonus = iniziali 40 righe su 40
--
-- E il secondo controllo ha tirato fuori una cosa che non sapevamo: la base
-- non e' sempre 250. Nel 2022-23 e nel 2023-24 e' **253**, uguale per tutte e
-- dieci, e nel 2024-25 torna a 250. Non e' un premio a qualcuno, e' la dote
-- di quegli anni: quindi una colonna sua, non nascosta dentro `bonus`.
alter table caprera.finanze add column if not exists base integer not null default 250;

comment on column caprera.finanze.base is
 'La dote di partenza uguale per tutte, prima di riporti e premi. 250 quasi sempre, 253 nel 2022-23 e nel 2023-24. Letta dal foglio: iniziali - riportati - bonus - ffp - assicurazione da esattamente questo, dieci societa su dieci.';
comment on column caprera.finanze.residui is
 'I «crediti non spesi» a fine stagione, letti dal foglio Pagamenti/Vincite/Crediti. NON si ricalcola da iniziali - spesi: fra i due passano il mercato di gennaio e i rimborsi da svincolo. Da qui esce il riportati dell''anno dopo, con ceil(residui/2), e torna 50 volte su 50.';

-- iniziali resta obbligatorio quasi ovunque, ma il 2020-21 il suo non ce l'ha:
-- verrebbe dalla scheda «Vincite 2019-20», che nel foglio non esiste. Meglio
-- una riga con dentro il vero (i non spesi) e un buco dichiarato, che nessuna
-- riga o un numero inventato.
alter table caprera.finanze alter column iniziali drop not null;

insert into caprera.finanze (stagione, societa, base, iniziali, riportati, bonus, residui) values
  ('2020-21','armata-rossa',        250, null, 0, 0,  2),
  ('2020-21','aston-ville',         250, null, 0, 0,  0),
  ('2020-21','disperata',           250, null, 0, 0,  1),
  ('2020-21','prosecco',            250, null, 0, 0,  6),
  ('2020-21','real-monghi',         250, null, 0, 0, 24),
  ('2020-21','roburro',             250, null, 0, 0,  3),
  ('2020-21','sanguemisto',         250, null, 0, 0,  3),
  ('2020-21','smit',                250, null, 0, 0, 11),
  ('2020-21','sporting-mangiapreti',250, null, 0, 0,  6),
  ('2020-21','subbuteo',            250, null, 0, 0,  0),

  ('2021-22','armata-rossa',        250, 247,  1, -4,  5),
  ('2021-22','aston-ville',         250, 252,  0,  2, 26),
  ('2021-22','disperata',           250, 248,  1, -3, 68),
  ('2021-22','prosecco',            250, 260,  3,  7, 13),
  ('2021-22','real-monghi',         250, 257, 12, -5,  6),
  ('2021-22','roburro',             250, 253,  2,  1, 14),
  ('2021-22','sanguemisto',         250, 251,  2, -1,  0),
  ('2021-22','smit',                250, 254,  6, -2, 20),
  ('2021-22','sporting-mangiapreti',250, 254,  3,  1, 24),
  ('2021-22','subbuteo',            250, 253,  0,  3,  2),

  ('2022-23','armata-rossa',        253, 257,  3,  1, 35),
  ('2022-23','aston-ville',         253, 261, 13, -5,  2),
  ('2022-23','disperata',           253, 291, 34,  4, 13),
  ('2022-23','prosecco',            253, 261,  7,  1, 30),
  ('2022-23','real-monghi',         253, 256,  3,  0,  2),
  ('2022-23','roburro',             253, 256,  7, -4, 19),
  ('2022-23','sanguemisto',         253, 263,  0, 10, 55),
  ('2022-23','smit',                253, 263, 10,  0,  9),
  ('2022-23','sporting-mangiapreti',253, 268, 12,  3, 44),
  ('2022-23','subbuteo',            253, 259,  1,  5,  4),

  ('2023-24','armata-rossa',        253, 275, 18,  4,  3),
  ('2023-24','aston-ville',         253, 255,  1,  1,  1),
  ('2023-24','disperata',           253, 267,  7,  7, 54),
  ('2023-24','prosecco',            253, 266, 15, -2,  8),
  ('2023-24','real-monghi',         253, 259,  1,  5, 10),
  ('2023-24','roburro',             253, 272, 10,  9,  0),
  ('2023-24','sanguemisto',         253, 284, 28,  3, 11),
  ('2023-24','smit',                253, 255,  5, -3,  0),
  ('2023-24','sporting-mangiapreti',253, 278, 22,  3, 23),
  ('2023-24','subbuteo',            253, 261,  2,  6, 13)
on conflict (stagione, societa) do nothing;

-- Il 2024-25 aveva gli stessi residui calcolati che sbagliavano nel 2025-26.
update caprera.finanze f set residui = v.n
  from (values ('armata-rossa',5),('aston-ville',3),('disperata',11),('prosecco',31),
               ('real-monghi',24),('roburro',3),('sanguemisto',26),('smit',0),
               ('sporting-mangiapreti',10),('subbuteo',35)) as v(societa,n)
 where f.stagione='2024-25' and f.societa=v.societa;

-- `spesi` e' per definizione la somma della rosa di settembre, e su quelle
-- stagioni la rosa di settembre e' un file vero, non una ricostruzione.
update caprera.finanze f
   set spesi = (select sum(r.costo) from caprera.rose r
                 where r.stagione=f.stagione and r.societa=f.societa and r.momento='partenza')
 where f.stagione in ('2020-21','2021-22','2022-23','2023-24') and f.spesi is null;
