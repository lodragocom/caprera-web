-- =====================================================================
--  Un contratto puo' finire dopo l'ultima stagione giocata.
--
--  `contratti.alla` aveva una chiave esterna su `stagioni`, e `anni` un
--  controllo che si fermava a cinque. Sono due regole che sembravano
--  ragionevoli e che il registro vero smentisce:
--
--    - Barella e' sotto contratto col Prosecco dal 2021-22 al 2026-27:
--      sei stagioni, e il 2026-27 non e' ancora stato giocato.
--    - Mancini (Aston Ville) e Calhanoglu (Real Monghi) arrivano a sette.
--    - Sucic, Wesley, Dimarco, Terracciano F., Mctominay, Thuram K. e
--      Angelino hanno contratti che finiscono nel 2027-28.
--
--  `stagioni` e' l'elenco delle stagioni *giocate*: ci si appoggiano le
--  classifiche, i calendari, i menu a tendina del sito. Metterci dentro il
--  2026-27 per far passare una chiave esterna vorrebbe dire far comparire
--  ovunque una stagione vuota, e sarebbe la coda che muove il cane.
--
--  Quindi: `dalla` resta agganciato a una stagione giocata — un contratto
--  comincia sempre in un anno che c'e' stato, e per tutti e 186 e' vero —
--  mentre `alla` guadagna la liberta' di guardare avanti, con un controllo
--  di forma al posto della chiave.
-- =====================================================================

alter table caprera.contratti drop constraint if exists contratti_alla_fkey;

alter table caprera.contratti drop constraint if exists contratti_alla_forma;
alter table caprera.contratti
  add constraint contratti_alla_forma check (alla ~ '^[0-9]{4}-[0-9]{2}$');

comment on column caprera.contratti.alla is
  'Ultima stagione del contratto. Puo'' essere una stagione non ancora '
  'giocata: e'' per questo che non e'' agganciata a «stagioni».';

-- Cinque anni era il tetto immaginato, non quello scritto nel registro.
alter table caprera.contratti drop constraint if exists contratti_anni_check;
alter table caprera.contratti
  add constraint contratti_anni_check check (anni >= 1 and anni <= 8);
