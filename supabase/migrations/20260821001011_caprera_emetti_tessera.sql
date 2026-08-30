-- Emettere una tessera e' l'atto con cui la Presidenza dice "questa email
-- guida questa societa'". Finora si faceva con un `insert` a mano, e un
-- `insert` a mano sbaglia in silenzio: una societa' che non esiste, un
-- incarico scritto male, la stessa email data a due squadre.
--
-- Qui diventa una funzione che controlla prima e spiega dopo. La puo'
-- chiamare solo chi ha un incarico che vede tutto: le regole di riga su
-- `tessere` restano quelle di prima, questa e' la porta d'ingresso.
create or replace function public.emetti_tessera(
    p_email text, p_societa text, p_nome text default null,
    p_incarichi text[] default '{}')
  returns text
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare e text; i text; gia text; u uuid;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' emettere tessere.';
  end if;

  e := lower(btrim(p_email));
  if e = '' or e not like '%@%' then
    raise exception 'Email non valida: "%"', p_email;
  end if;

  if not exists (select 1 from caprera.societa where id = p_societa) then
    raise exception 'La societa'' "%" non esiste in archivio.', p_societa;
  end if;

  foreach i in array p_incarichi loop
    if not exists (select 1 from caprera.incarichi where id = i) then
      raise exception 'L''incarico "%" non esiste.', i;
    end if;
  end loop;

  select societa into gia from caprera.tessere where email = e;
  if gia is not null and gia <> p_societa then
    raise exception 'A % e'' gia'' intestata la tessera di "%": toglila prima di darle "%".',
                    e, gia, p_societa;
  end if;

  insert into caprera.tessere (email, societa, nome, ruolo, incarichi)
       values (e, p_societa, p_nome,
               case when 'presidenza' = any(p_incarichi) then 'presidenza' else 'mister' end,
               p_incarichi)
  on conflict (email) do update
     set societa = excluded.societa, nome = excluded.nome,
         ruolo = excluded.ruolo, incarichi = excluded.incarichi;

  -- se quella persona si era gia' registrata, la tessera vale da subito
  select id into u from auth.users where lower(email) = e;
  if u is not null then
    perform caprera.attiva_tessera(u, e);
    return format('Tessera aggiornata per %s (%s). Era gia'' registrata: vale da adesso.', e, p_societa);
  end if;

  return format('Tessera emessa per %s (%s). Ora puo'' registrarsi con questa email.', e, p_societa);
end $$;

revoke all on function public.emetti_tessera(text, text, text, text[]) from public, anon;
grant execute on function public.emetti_tessera(text, text, text, text[]) to authenticated;
