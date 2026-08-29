-- Il listone aveva come chiave (stagione, nome), e gli omonimi non ci stavano.
--
-- Non sono errori del file: sono due persone diverse. Nel 2015-16 c'e' Zanon
-- difensore dell'Atalanta e Zanon difensore della Fiorentina; nel 2022-23
-- Stankovic portiere del Venezia e Stankovic centrocampista dell'Inter.
-- Tenerne uno solo per far contenta la chiave vorrebbe dire cancellare una
-- persona, e per una trentina di righe su novemila non vale mai la pena.
--
-- La chiave diventa una colonna sua, e l'unicita' si sposta sulla quaterna
-- che identifica davvero una riga di listone. `club` puo' mancare, quindi
-- nell'indice entra come stringa vuota: due righe senza squadra e con lo
-- stesso nome e ruolo restano una sola, ed e' giusto cosi'.
alter table caprera.listone drop constraint listone_pkey;
alter table caprera.listone add column id bigint generated always as identity primary key;
create unique index listone_una_riga_sola
  on caprera.listone (stagione, nome, ruolo, coalesce(club, ''));
