-- Chi vede cosa. Il filtro lo fa il database, non il sito: una pagina scritta
-- male non puo' far uscire dati che il database non manda.

create or replace function caprera.mia_societa() returns text
  language sql stable security definer set search_path = caprera, public as $$
    select societa from caprera.misteri where utente = auth.uid()
$$;

create or replace function caprera.sono_presidenza() returns boolean
  language sql stable security definer set search_path = caprera, public as $$
    select exists (select 1 from caprera.misteri
                    where utente = auth.uid() and ruolo = 'presidenza')
$$;

-- Archivio pubblico: risultati, classifiche, coppe, rose e formazioni sono la
-- storia della lega e stanno gia' su Fantapazz. Tutti leggono, nessuno scrive.
do $$
declare t text;
begin
  foreach t in array array[
    'lega','stagioni','societa','societa_nomi_storici','partecipazioni',
    'competizioni','edizioni','turni','partite','classifiche',
    'calciatori','calciatori_nomi','rose','listone',
    'formazioni','formazione_giocatori','bonus_tipi','formazione_bonus',
    'formazione_modificatori']
  loop
    execute format('alter table caprera.%I enable row level security', t);
    execute format('create policy leggono_tutti on caprera.%I for select using (true)', t);
  end loop;
end $$;

-- Contratti e crediti: ognuno i propri. La Presidenza vede tutto.
alter table caprera.contratti enable row level security;
alter table caprera.finanze   enable row level security;
alter table caprera.misteri   enable row level security;

create policy i_miei_contratti on caprera.contratti
  for select using (societa = caprera.mia_societa() or caprera.sono_presidenza());

create policy le_mie_finanze on caprera.finanze
  for select using (societa = caprera.mia_societa() or caprera.sono_presidenza());

create policy la_mia_riga on caprera.misteri
  for select using (utente = auth.uid() or caprera.sono_presidenza());

-- Nessuno scrive dal sito: l'archivio si aggiorna dagli script di
-- caricamento, che girano con la chiave di servizio e saltano queste regole.
-- Serve a evitare che una pagina possa cambiare un risultato di dieci anni fa.
grant usage on schema caprera to anon, authenticated;
grant select on all tables in schema caprera to anon, authenticated;
alter default privileges in schema caprera grant select on tables to anon, authenticated;
