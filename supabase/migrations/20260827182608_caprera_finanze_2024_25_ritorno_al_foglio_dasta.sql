-- Ritiro la correzione di ieri sul 2024-25: era sbagliata, e le righe che ho
-- toccato erano giuste da prima.
--
-- Ieri avevo preso i crediti iniziali dalla scheda «Vincite 2023-24» di Guido.
-- Ma quella scheda e' il registro dei premi, non il foglio con cui l'asta si
-- e' fatta. Il foglio dell'asta - Rose_Caprera_202425, Rose_Asta_Finale - dice
-- «Crediti Iniziali» societa' per societa', e sono esattamente i numeri che il
-- database aveva prima che li toccassi: 256 il Prosecco, 253 l'Armata Rossa.
--
-- Sull'Armata Rossa i due documenti non vanno d'accordo, ed e' l'unica: il
-- registro dice 255, il foglio dell'asta 253. L'asta si e' giocata con 253,
-- quindi vale 253 - ma la differenza resta, e sta scritta qui.
--
-- Il 2023-24 invece il foglio lo conferma riga per riga: dieci iniziali su
-- dieci identici a quelli gia' caricati, e i «Crediti da 2022/23» combaciano
-- con i totali di Guido su tutte e dieci. Li' non c'e' niente da cambiare.
update caprera.finanze f
   set iniziali = v.iniziali, riportati = v.carry,
       bonus = v.iniziali - 250 - v.carry, ffp = 0, giovani = 0
  from (values ('armata-rossa',        253,  2),
               ('aston-ville',         262,  1),
               ('disperata',           283, 27),
               ('prosecco',            256,  4),
               ('real-monghi',         264,  5),
               ('roburro',             250,  0),
               ('sanguemisto',         261,  6),
               ('smit',                259,  0),
               ('sporting-mangiapreti',266, 12),
               ('subbuteo',            266,  7)
       ) as v(societa, iniziali, carry)
 where f.stagione='2024-25' and f.societa=v.societa;

comment on table caprera.finanze is
 'Il bilancio di ogni societa per stagione. Due fonti, e non dicono la stessa cosa: il foglio Rose_Caprera_<anno> e il verbale dell''asta e da li vengono `iniziali` e la composizione; la scheda Pagamenti/Vincite/Crediti e il registro dei premi e da li viene `residui` (i «crediti non spesi» di fine anno, da cui esce il riportati dell''anno dopo con ceil(meta)). Dove i due divergono vince il foglio dell''asta, perche e con quello che si e giocato: succede una volta sola, Armata Rossa 2024-25, 253 contro 255.';
