-- Fotografia della pagina Clubs > Rose. Non sostituisce rose o contratti canonici.
create table caprera.rose_storico_shiny (
 societa text not null references caprera.societa, ordine int not null,
 stagione text not null references caprera.stagioni, nome text not null, ruolo text not null check(ruolo in ('P','D','C','A')),
 costo numeric, valore_fp numeric, club text, mv numeric, presenze int,
 fm_fp numeric, mv_fp numeric, fm_ro_fp numeric, mv_ro_fp numeric,
 aggiornato_al date not null, primary key(societa,ordine));
create table caprera.rose_assenze_shiny (
 societa text not null references caprera.societa, stagione text not null references caprera.stagioni,
 nome text not null, ragione text not null check(ragione in ('Indisponibili','Assenti','Squalificati')),
 conteggio int not null check(conteggio>=0), costo numeric not null, valore_fp numeric not null,
 aggiornato_al date not null, primary key(societa,stagione,nome,ragione));
create table caprera.rose_sintesi_shiny (
 societa text not null references caprera.societa, stagione text not null references caprera.stagioni,
 costo numeric, valore_fp numeric, giocatori int not null, aggiornato_al date not null,
 primary key(societa,stagione));
create table caprera.rose_riservate_shiny (
 societa text not null references caprera.societa, stagione text not null references caprera.stagioni,
 wage numeric, contratti text, aggiornato_al date not null, primary key(societa,stagione));

do $$ declare t text; begin
 foreach t in array array['rose_storico_shiny','rose_assenze_shiny','rose_sintesi_shiny'] loop
  execute format('alter table caprera.%I enable row level security',t);
  execute format('revoke all on caprera.%I from anon,authenticated',t);
  execute format('grant select on caprera.%I to anon,authenticated',t);
  execute format('create policy lettura_sportiva on caprera.%I for select to anon,authenticated using(true)',t);
  execute format('create view public.%I with(security_invoker=true) as select * from caprera.%I',t,t);
  execute format('grant select on public.%I to anon,authenticated',t);
 end loop;
end $$;
alter table caprera.rose_riservate_shiny enable row level security;
revoke all on caprera.rose_riservate_shiny from public,anon,authenticated;
create function public.dettagli_rosa_shiny(p_societa text) returns jsonb
 language sql stable security definer set search_path='' as $$
 select to_jsonb(r) from caprera.rose_riservate_shiny r
 where r.societa=p_societa and auth.uid() is not null
 and (r.societa=caprera.mia_societa() or caprera.vede_tutto())
 order by r.stagione desc limit 1
$$;
revoke all on function public.dettagli_rosa_shiny(text) from public,anon;
grant execute on function public.dettagli_rosa_shiny(text) to authenticated;
notify pgrst,'reload schema';
