-- Chi vede cosa, per gli incarichi e le schede.
alter table caprera.incarichi    enable row level security;
alter table caprera.assegnazioni enable row level security;
alter table caprera.schede       enable row level security;

-- Gli incarichi come elenco sono pubblici: dire che esiste un Tesoriere non
-- rivela niente di nessuno.
create policy incarichi_leggono_tutti on caprera.incarichi for select using (true);

-- Chi ricopre cosa lo vedono i tesserati: in una lega di dieci persone sapere
-- chi arbitra le contestazioni fa parte delle regole del gioco.
create policy assegnazioni_ai_tesserati on caprera.assegnazioni
  for select to authenticated using (true);

-- La scheda: la propria, sempre. Le altrui, solo a chi ha un incarico che
-- vede tutto — ed e' l'unico modo per arrivare a un numero di telefono.
create policy scheda_mia on caprera.schede
  for select using (utente = auth.uid() or caprera.vede_tutto());

-- Scrivere la propria, e solo la propria. Nemmeno la Presidenza cambia il
-- soprannome di un altro: e' roba sua.
create policy scheda_scrivo_la_mia on caprera.schede
  for insert to authenticated with check (utente = auth.uid());
create policy scheda_aggiorno_la_mia on caprera.schede
  for update to authenticated using (utente = auth.uid()) with check (utente = auth.uid());


-- ------------------------------------------------------- le finestre
/** La mia scheda, con l'email che sta in auth. */
create or replace view public.la_mia_scheda
with (security_invoker = on) as
  select s.utente, s.nome, s.cognome, s.soprannome, s.telefono,
         s.videochiamata, s.aggiornata,
         (select u.email from auth.users u where u.id = s.utente) as email
    from caprera.schede s
   where s.utente = auth.uid();

/** Lo staff della lega: chi guida cosa e chi ricopre quali incarichi.
    Il telefono NON c'e': per quello serve `schede_complete`. */
create or replace view public.staff
with (security_invoker = on) as
  select m.utente, m.societa,
         coalesce(nullif(btrim(coalesce(s.nome,'') || ' ' || coalesce(s.cognome,'')), ''),
                  s.soprannome, m.nome) as chi,
         s.soprannome,
         (select coalesce(array_agg(a.incarico order by i.ordine), '{}')
            from caprera.assegnazioni a join caprera.incarichi i on i.id = a.incarico
           where a.utente = m.utente and (a.al is null or a.al > now())) as incarichi
    from caprera.misteri m
    left join caprera.schede s on s.utente = m.utente;

/** Tutto, telefoni compresi: le regole di riga la rendono vuota per chi non
    ha un incarico che vede tutto. */
create or replace view public.schede_complete
with (security_invoker = on) as
  select s.utente, m.societa, s.nome, s.cognome, s.soprannome, s.telefono,
         s.videochiamata,
         (select u.email from auth.users u where u.id = s.utente) as email
    from caprera.schede s
    left join caprera.misteri m on m.utente = s.utente;

create or replace view public.incarichi
with (security_invoker = on) as
  select id, nome, descrizione, vede_tutto, puo_scrivere, ordine
    from caprera.incarichi;

create or replace view public.i_miei_incarichi
with (security_invoker = on) as
  select a.incarico, i.nome, i.vede_tutto, i.puo_scrivere
    from caprera.assegnazioni a join caprera.incarichi i on i.id = a.incarico
   where a.utente = auth.uid() and (a.al is null or a.al > now());

grant select on public.incarichi to anon, authenticated;
grant select, insert, update on public.la_mia_scheda to authenticated;
grant select on public.staff, public.schede_complete, public.i_miei_incarichi to authenticated;

-- La vista `la_mia_scheda` non e' aggiornabile da sola (ha un sotto-select):
-- si scrive con questa, che tocca solo la riga di chi chiama.
create or replace function public.salva_la_mia_scheda(
    p_nome text, p_cognome text, p_soprannome text,
    p_telefono text, p_videochiamata text)
  returns void
  language plpgsql security definer set search_path = caprera, public, auth as $$
begin
  if auth.uid() is null then raise exception 'non sei entrato'; end if;
  insert into caprera.schede (utente, nome, cognome, soprannome, telefono, videochiamata)
       values (auth.uid(), p_nome, p_cognome, p_soprannome, p_telefono, p_videochiamata)
  on conflict (utente) do update
     set nome = excluded.nome, cognome = excluded.cognome,
         soprannome = excluded.soprannome, telefono = excluded.telefono,
         videochiamata = excluded.videochiamata;
end $$;

grant execute on function public.salva_la_mia_scheda(text,text,text,text,text) to authenticated;
