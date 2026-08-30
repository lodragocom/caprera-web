-- ============================================================================
-- Gli avvisi alla Presidenza.
--
-- Finora, quando un mister si registrava, non lo sapeva nessuno: il trigger
-- attivava la tessera e tirava dritto. Con nove mister che si iscrivono in
-- giorni diversi, accorgersene voleva dire ricordarsi di guardare.
--
-- COME, E PERCHE' NON SERVE UNA EDGE FUNCTION
-- --------------------------------------------
-- `pg_net` manda richieste HTTP dal database, in modo **asincrono**: la
-- chiamata parte e la transazione non la aspetta. E' la differenza che conta —
-- se l'invio fosse sincrono, un'API lenta rallenterebbe una registrazione, e
-- un'API ferma la bloccherebbe. Nessuno deve restare fuori dal sito perche'
-- Resend non risponde.
--
-- La chiave di Resend sta nel **vault**, non in questo file e non in una
-- tabella: e' l'unico posto del database fatto per i segreti.
--
-- ⚠️ Se la chiave non c'e', la funzione NON fallisce e non blocca niente:
-- scrive un avviso nei log e tira dritto. Un avviso mancato e' un fastidio,
-- una registrazione impedita e' un guasto.
-- ============================================================================

create extension if not exists pg_net with schema extensions;

create or replace function caprera.avvisa_presidenza(p_oggetto text, p_testo text)
returns void
language plpgsql
security definer
set search_path = caprera, public, extensions, pg_temp
as $$
declare chiave text; dove text;
begin
  select decrypted_secret into chiave
    from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into dove
    from vault.decrypted_secrets where name = 'avvisi_a';
  dove := coalesce(dove, 'info@federazionecaprera.com');

  if chiave is null then
    raise warning 'avviso non mandato (manca resend_api_key nel vault): %', p_oggetto;
    return;
  end if;

  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
                 'Authorization', 'Bearer ' || chiave,
                 'Content-Type',  'application/json'),
    body    := jsonb_build_object(
                 'from',    'Federazione Caprera <noreply@federazionecaprera.com>',
                 'to',      jsonb_build_array(dove),
                 'subject', p_oggetto,
                 'text',    p_testo)
  );
exception when others then
  -- Vale la stessa regola dell'attivazione della tessera (ADR-003): un guasto
  -- accessorio non puo' far fallire l'operazione principale.
  raise warning 'avviso non mandato: % %', SQLSTATE, SQLERRM;
end;
$$;

comment on function caprera.avvisa_presidenza(text, text) is
  'Manda un''email alla Presidenza via Resend, in modo asincrono. La chiave sta '
  'nel vault come `resend_api_key`; il destinatario in `avvisi_a`, e in mancanza '
  'info@federazionecaprera.com. Se la chiave manca, non fallisce: avvisa nei log.';


-- Il trigger del diario manda anche l'avviso.
create or replace function caprera.diario_utente_nuovo()
returns trigger
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare t caprera.tessere; tit text; txt text;
begin
  select * into t from caprera.tessere where email = lower(new.email);

  if t.societa is not null then
    tit := format('%s si è registrato', coalesce(t.nome, new.email));
    txt := format('%s ha attivato la Tessera del Tifoso.%s'
                  || E'\n\nSocietà: %s\nIndirizzo: %s\n\n'
                  || 'La tessera si è attivata da sola all''accesso: non serve fare niente.',
                  coalesce(t.nome, new.email), '', t.societa, new.email);
  else
    tit := format('%s si è registrato, senza tessera', new.email);
    txt := format('Qualcuno si è registrato con un indirizzo a cui non è intestata nessuna '
                  || E'tessera.\n\nIndirizzo: %s\n\n'
                  || 'Ha un accesso e nessuna società. Se è uno dei mister, gli si intesta una '
                  || 'tessera dalla dashboard e si collega da solo: l''ordine non conta.',
                  new.email);
  end if;

  insert into caprera.diario (tipo, titolo, testo, societa, stagione)
       values ('evento', tit, txt, t.societa,
               (select id from caprera.stagioni order by ordine desc limit 1));

  perform caprera.avvisa_presidenza('Caprera · ' || tit, txt);
  return new;
exception when others then
  raise warning 'diario non scritto per %: % %', new.email, SQLSTATE, SQLERRM;
  return new;
end;
$$;
