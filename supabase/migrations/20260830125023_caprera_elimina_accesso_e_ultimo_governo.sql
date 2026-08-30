-- ============================================================================
-- Eliminare un accesso — deciso da L0 il 30/08.
--
-- `revoca_tessera` toglie la societa' e lascia l'account: e' la via normale,
-- perche' l'account e' della persona. Questa invece cancella la persona dal
-- sistema, e non si torna indietro: schede, incarichi, collegamento e accesso.
--
-- Per questo ha TRE porte chiuse, e nessuna delle tre e' un capriccio:
--   1. serve un incarico di governo;
--   2. non si cancella se stessi — chi lo fa perde la sessione a meta' e non
--      capisce cosa e' successo;
--
-- Ci avevo messo una terza porta — «non si cancella l'ultimo che puo'
-- governare» — e non serve: chi chiama governa per forza (porta 1) e non puo'
-- cancellare se stesso (porta 2), quindi dopo l'operazione resta sempre almeno
-- lui. Era codice che sembrava prudenza e non poteva scattare mai. Il caso
-- vero — la lega che resta senza governo — si crea in un altro modo: togliendo
-- a se stessi l'incarico da `cambia_incarichi`. La' la porta serve davvero.
-- ============================================================================

create or replace function public.elimina_accesso(p_email text)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare e text; u uuid; s text;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' eliminare un accesso.';
  end if;

  e := lower(btrim(p_email));
  select id into u from auth.users where lower(email) = e;
  if u is null then
    raise exception 'Nessun accesso registrato con %.', e;
  end if;

  if u = auth.uid() then
    raise exception 'Non puoi eliminare il tuo stesso accesso: chiedilo a un altro incarico di governo.';
  end if;

  select societa into s from caprera.tessere where email = e;

  delete from caprera.schede       where utente = u;
  delete from caprera.assegnazioni where utente = u;
  delete from caprera.misteri      where utente = u;
  delete from caprera.tessere      where email = e;
  delete from auth.users           where id = u;

  return format('Accesso di %s eliminato%s. Non si torna indietro: se serve di nuovo, si registra da capo.',
                e, case when s is null then '' else format(' (guidava "%s", ora scoperta)', s) end);
end;
$$;

revoke all on function public.elimina_accesso(text) from public, anon;
grant execute on function public.elimina_accesso(text) to authenticated;


-- ============================================================================
-- E la porta che mancava davvero: `cambia_incarichi`.
--
-- Da lì ci si può togliere l'incarico di governo da soli. Se lo fa l'ultimo
-- che ce l'ha, la lega resta senza nessuno che possa emettere tessere o
-- assegnare incarichi: si riapre solo dal cruscotto Supabase, cioè proprio la
-- cosa da cui questa dashboard doveva liberare la Presidenza.
--
-- Non è un caso di scuola: con dieci società il governante è UNO.
-- ============================================================================

create or replace function public.cambia_incarichi(p_email text, p_incarichi text[])
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare e text; i text; u uuid; altri int; governava boolean; governera boolean;
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

  select id into u from auth.users where lower(email) = e;

  -- La lega resterebbe senza governo?
  if u is not null then
    select exists (select 1 from caprera.assegnazioni a
                     join caprera.incarichi ic on ic.id = a.incarico
                    where a.utente = u and ic.vede_tutto and (a.al is null or a.al > now()))
      into governava;

    select exists (select 1 from caprera.incarichi ic
                    where ic.id = any(p_incarichi) and ic.vede_tutto)
      into governera;

    select count(distinct a.utente) into altri
      from caprera.assegnazioni a
      join caprera.incarichi ic on ic.id = a.incarico
     where ic.vede_tutto and (a.al is null or a.al > now()) and a.utente <> u;

    if governava and not governera and altri = 0 then
      raise exception
        'E'' l''ultimo incarico di governo della lega: dallo a qualcun altro prima di toglierlo, '
        'altrimenti nessuno potra'' piu'' emettere tessere.';
    end if;
  end if;

  update caprera.tessere set incarichi = p_incarichi where email = e;

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
