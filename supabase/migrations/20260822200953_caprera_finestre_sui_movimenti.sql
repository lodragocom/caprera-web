-- Due finestre su caprera.movimenti, con la stessa asimmetria dei contratti:
-- al mister il suo estratto conto intero, a chiunque solo i premi.

-- 1. Al mister: tutto, ma solo il suo. security_invoker=on, quindi decide la
--    policy i_miei_movimenti — come finanze_mie e contratti_miei.
create or replace view public.movimenti_miei
  with (security_invoker = on) as
  select stagione, societa, categoria, voce, crediti
    from caprera.movimenti;

comment on view public.movimenti_miei is
  'L''estratto conto del mister: da dove viene ogni credito. '
  'La riservatezza la fa la policy sulla tabella, non questa vista.';

grant select on public.movimenti_miei to anon, authenticated;

-- 2. A chiunque: solo le categorie che discendono da fatti gia' pubblici —
--    piazzamenti, coppe, giochi. security_invoker=off perche' la tabella e'
--    chiusa ad anon: e' la clausola `in (...)` a essere il confine, come per
--    contratti_pubblici.
--
--    Restano FUORI, e non e' una dimenticanza:
--    · `penalita`   — sono materia disciplinare, e le voci del Caprera Etica
--                     nominano fatti veri di persone vere. Le vede il mister
--                     e la Presidenza.
--    · `assicurazioni` — sono soldi, e i soldi non hanno finestra in public.
create or replace view public.premi_pubblici
  with (security_invoker = off) as
  select stagione, societa, categoria, voce, crediti
    from caprera.movimenti
   where categoria in ('classifiche', 'diritti-tv', 'serie-a-awards',
                       'premi-caprera', 'giochi');

comment on view public.premi_pubblici is
  'I premi in crediti che discendono da piazzamenti pubblici. '
  'Niente penalita'', niente assicurazioni: quelle non escono da finanze.';

grant select on public.premi_pubblici to anon, authenticated;
