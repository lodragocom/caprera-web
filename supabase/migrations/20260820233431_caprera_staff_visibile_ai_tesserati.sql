-- Lo staff serve a sapere a chi scrivere. Cosi' com'era, un mister ci vedeva
-- una riga sola - sé stesso - perche' `misteri` e' chiusa a chiave e la vista
-- la interrogava con i suoi occhi. Una rubrica di una persona non e' una
-- rubrica.
--
-- Qui la vista passa da una funzione che legge con i permessi del database
-- invece che con quelli del mister. La riga in piu' che si concede e'
-- esattamente questa: chi guida quale societa' e con quale incarico. Telefono
-- ed email non entrano nella funzione, quindi non c'e' modo di farli uscire -
-- quelli restano in `schede_complete`, dove li vede solo chi vede tutto.

create or replace function caprera.lo_staff()
  returns table (utente uuid, societa text, chi text, soprannome text, incarichi text[])
  language sql stable security definer set search_path = caprera, public, auth as $$
  select m.utente, m.societa,
         coalesce(nullif(btrim(coalesce(s.nome,'') || ' ' || coalesce(s.cognome,'')), ''),
                  s.soprannome, m.nome) as chi,
         s.soprannome,
         (select coalesce(array_agg(a.incarico order by i.ordine), '{}')
            from caprera.assegnazioni a
            join caprera.incarichi i on i.id = a.incarico
           where a.utente = m.utente and (a.al is null or a.al > now())) as incarichi
    from caprera.misteri m
    left join caprera.schede s on s.utente = m.utente
   where auth.uid() is not null   -- ai tesserati, non al pubblico
$$;

revoke all on function caprera.lo_staff() from public;
grant execute on function caprera.lo_staff() to authenticated;

create or replace view public.staff
  with (security_invoker = on) as
  select utente, societa, chi, soprannome, incarichi from caprera.lo_staff();

revoke all on public.staff from anon;
grant select on public.staff to authenticated;
