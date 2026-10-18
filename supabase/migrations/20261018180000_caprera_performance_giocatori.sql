-- Rendimenti sportivi pubblicati in Lega > Giocatori > Performance nella Shiny.
create table caprera.performance_giocatori (
 stagione text not null references caprera.stagioni, nome text not null, ruolo char(1) not null check(ruolo in ('P','D','C','A')), societa text references caprera.societa, club text, giornata_serie_a int not null check(giornata_serie_a between 1 and 38),
 voto numeric, fpstat numeric, voto_round numeric, fm numeric, fm_round numeric, valore_fp numeric, aggiornato_al date not null, primary key(stagione,nome,ruolo,giornata_serie_a));
create table caprera.performance_medie (
 stagione text not null references caprera.stagioni, nome text not null, ruolo char(1) not null check(ruolo in ('P','D','C','A')), societa text references caprera.societa, club text,
 valore_fp numeric, voto_mean numeric, fpstat_mean numeric, voto_round_mean numeric, fm_mean numeric, fm_round_mean numeric, voto_min numeric, fpstat_min numeric, voto_round_min numeric, fm_min numeric, fm_round_min numeric, voto_max numeric, fpstat_max numeric, voto_round_max numeric, fm_max numeric, fm_round_max numeric, aggiornato_al date not null, primary key(stagione,nome,ruolo));
alter table caprera.performance_giocatori enable row level security;
revoke all on caprera.performance_giocatori from anon,authenticated;
grant select on caprera.performance_giocatori to anon,authenticated;
create policy lettura_sportiva on caprera.performance_giocatori for select to anon,authenticated using (true);
create view public.performance_giocatori with (security_invoker=true) as select * from caprera.performance_giocatori;
grant select on public.performance_giocatori to anon,authenticated;
comment on table caprera.performance_giocatori is 'Fonte: https://caprera.shinyapps.io/caprera/ > Lega > Giocatori > Performance. Snapshot, non dati delle formazioni consegnate.';
alter table caprera.performance_medie enable row level security;
revoke all on caprera.performance_medie from anon,authenticated;
grant select on caprera.performance_medie to anon,authenticated;
create policy lettura_sportiva on caprera.performance_medie for select to anon,authenticated using (true);
create view public.performance_medie with (security_invoker=true) as select * from caprera.performance_medie;
grant select on public.performance_medie to anon,authenticated;
comment on table caprera.performance_medie is 'Fonte: https://caprera.shinyapps.io/caprera/ > Lega > Giocatori > Performance. Snapshot, non dati delle formazioni consegnate.';
