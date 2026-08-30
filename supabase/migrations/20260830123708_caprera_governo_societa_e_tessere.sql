-- ============================================================================
-- La dashboard della Presidenza — Fase 1: le persone.
--
-- Tre attrezzi, e tutti e tre chiudono la porta nello stesso posto:
-- `caprera.vede_tutto()`, come gia' fa `emetti_tessera`. Sono security definer
-- perche' devono leggere le email DEGLI ALTRI — cosa che una vista
-- security_invoker non puo' fare, ed e' il motivo per cui `schede_complete`
-- era rimasta rotta e rimandata in `da-applicare-messa-online.sql`.
--
-- La riservatezza resta nel database. Una pagina scritta male puo' al massimo
-- non mostrare qualcosa: non puo' emettere, revocare, ne' leggere per conto di
-- chi non ha l'incarico.
-- ============================================================================


-- 1. CHI GUIDA COSA -----------------------------------------------------------
-- Una riga per societa' ATTIVA, anche quando la tessera non c'e': l'elenco
-- serve a vedere chi manca, quindi le societa' scoperte devono comparire.
-- Per questo e' una LEFT JOIN e non una lista di tessere.
create or replace function public.governo_societa()
returns table (
  societa      text,
  nome_societa text,
  email        text,
  nome         text,
  ruolo        text,
  incarichi    text[],
  emessa       timestamptz,
  usata_il     timestamptz,
  registrato   boolean,
  collegato    boolean
)
language sql
security definer
set search_path = caprera, public, pg_temp
stable
as $$
  select s.id, s.nome,
         t.email, t.nome, t.ruolo, t.incarichi, t.emessa, t.usata_il,
         -- si e' registrato: esiste un utente con quella email
         exists (select 1 from auth.users u where lower(u.email) = t.email),
         -- e' collegato davvero: la tessera ha prodotto una riga in misteri
         exists (select 1 from caprera.misteri m
                  where m.societa = s.id
                    and m.utente in (select u.id from auth.users u
                                      where lower(u.email) = t.email))
    from caprera.societa s
    left join caprera.tessere t on t.societa = s.id
   where s.attiva
     and caprera.vede_tutto()   -- niente incarico, nessuna riga: non un errore, il vuoto
   order by s.nome;
$$;

comment on function public.governo_societa() is
  'Elenco per la dashboard della Presidenza: le societa'' attive, chi le guida, chi manca. '
  'Security definer perche'' legge le email degli altri; senza un incarico con vede_tutto '
  'non restituisce nulla.';

revoke all on function public.governo_societa() from public, anon;
grant execute on function public.governo_societa() to authenticated;


-- 2. REVOCARE -----------------------------------------------------------------
-- Toglie la tessera E il collegamento (misteri, assegnazioni). NON tocca
-- l'account: quello e' della persona, non della lega, e cancellarlo sarebbe
-- una decisione diversa presa di straforo. Chi resta ha un accesso e nessuna
-- societa' — il caso che ADR-003 gia' prevede e che la pagina sa raccontare.
--
-- Ed e' reversibile: riemettendo la tessera si ricollega da solo, perche'
-- l'ordine fra registrazione e tessera non conta.
create or replace function public.revoca_tessera(p_email text)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare e text; s text; u uuid;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' revocare una tessera.';
  end if;

  e := lower(btrim(p_email));
  select societa into s from caprera.tessere where email = e;
  if s is null then
    raise exception 'Nessuna tessera intestata a %.', e;
  end if;

  select id into u from auth.users where lower(email) = e;
  if u is not null then
    delete from caprera.assegnazioni where utente = u;
    delete from caprera.misteri      where utente = u;
  end if;
  delete from caprera.tessere where email = e;

  return format('Tessera di %s revocata (era "%s"). L''accesso resta, la societa'' no.', e, s);
end;
$$;

revoke all on function public.revoca_tessera(text) from public, anon;
grant execute on function public.revoca_tessera(text) to authenticated;


-- 3. CAMBIARE GLI INCARICHI ---------------------------------------------------
-- Finora si poteva solo riemettere la tessera. Qui si cambiano gli incarichi
-- e basta, e valgono subito anche per chi e' gia' dentro: `assegnazioni` viene
-- riscritta, non aggiunta, altrimenti un incarico tolto resterebbe in piedi.
create or replace function public.cambia_incarichi(p_email text, p_incarichi text[])
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare e text; i text; u uuid;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' cambiare gli incarichi.';
  end if;

  e := lower(btrim(p_email));
  if not exists (select 1 from caprera.tessere where email = e) then
    raise exception 'Nessuna tessera intestata a %.', e;
  end if;

  foreach i in array p_incarichi loop
    if not exists (select 1 from caprera.incarichi where id = i) then
      raise exception 'L''incarico "%" non esiste.', i;
    end if;
  end loop;

  update caprera.tessere set incarichi = p_incarichi where email = e;

  select id into u from auth.users where lower(email) = e;
  if u is not null then
    delete from caprera.assegnazioni where utente = u;
    insert into caprera.assegnazioni (utente, incarico)
         select u, x from unnest(p_incarichi) x;
  end if;

  return format('Incarichi di %s: %s', e,
                coalesce(nullif(array_to_string(p_incarichi, ', '), ''), 'nessuno'));
end;
$$;

revoke all on function public.cambia_incarichi(text, text[]) from public, anon;
grant execute on function public.cambia_incarichi(text, text[]) to authenticated;
