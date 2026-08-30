-- `v_forma` senza l'id della partita.
--
-- La forma delle ultime giornate si vede in Classifica e nella dashboard del
-- mister, ma da una pallina V/N/P non si poteva arrivare da nessuna parte:
-- la vista non portava l'id, e senza id non c'e' tabellino da aprire.
-- `v_gare` ce l'ha gia', bastava non lasciarlo indietro.
--
-- Si ricrea invece di sostituirla: `create or replace` non sa aggiungere una
-- colonna in testa, e l'id in fondo starebbe fuori posto.
drop view if exists public.v_forma;
drop view if exists caprera.v_forma;

create view caprera.v_forma as
  select id, stagione, societa, giornata,
         case
           when gol_fatti > gol_subiti then 'V'
           when gol_fatti = gol_subiti then 'N'
           else 'P'
         end as esito,
         gol_fatti, gol_subiti, fantapunti, avversario, in_casa
    from caprera.v_gare
   where competizione = 'campionato' and giocata;

create view public.v_forma
  with (security_invoker = on) as
  select * from caprera.v_forma;

revoke all on public.v_forma from anon, authenticated;
grant select on public.v_forma to anon, authenticated;
