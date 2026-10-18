-- Metriche pubbliche della Shiny, distinte dai bilanci e dagli schieramenti.
create table caprera.statistiche_giornata (
  stagione text not null references caprera.stagioni(id),
  societa text not null references caprera.societa(id),
  giornata integer not null check(giornata>0),
  fantapunti numeric,
  valore_rosa integer,
  fair_play numeric,
  panchina_oro numeric,
  zdenek numeric,
  fonte text not null,
  aggiornato_al date not null,
  primary key(stagione,societa,giornata)
);
alter table caprera.statistiche_giornata enable row level security;
revoke all on caprera.statistiche_giornata from anon,authenticated;
grant select on caprera.statistiche_giornata to anon,authenticated;
create policy statistiche_pubbliche on caprera.statistiche_giornata for select to anon,authenticated
using(exists(select 1 from caprera.stagioni s where s.id=stagione and s.lega='caprera'));
create view public.statistiche_giornata with(security_invoker=on) as
select stagione,societa,giornata,fantapunti,valore_rosa,fair_play,panchina_oro,zdenek,fonte,aggiornato_al
from caprera.statistiche_giornata;
revoke all on public.statistiche_giornata from anon,authenticated;
grant select on public.statistiche_giornata to anon,authenticated;
comment on table caprera.statistiche_giornata is
'Metriche ufficiali osservate per singola giornata; NULL indica dato assente, mai zero implicito. Fonte e data obbligatorie. Nessun salario o dato finanziario.';
