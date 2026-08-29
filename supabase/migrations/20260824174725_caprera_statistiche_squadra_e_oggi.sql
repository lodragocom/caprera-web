-- La colonna `squadra` del foglio non e' la squadra di quella stagione: e'
-- quella del giorno in cui il file e' stato scaricato, timbrata identica su
-- tutti gli anni dello stesso giocatore. Su 980 giocatori presenti in quattro
-- o piu' stagioni, 880 hanno una sola squadra in tutte: Belotti risulta al
-- Cagliari dal 2015-16 al 2025-26, Reina al Como dal 2015-16, Cordaz all'Inter
-- dal 2015-16. Nessuno dei tre ci giocava.
--
-- Si vede anche nel confronto col club che la rosa registra per quella
-- stagione: coincide nel 94% dei casi nel 2025-26 e scende regolarmente fino
-- al 46% nel 2016-17. Non e' rumore, e' l'eta' del dato.
--
-- Non la cancello — per il 2025-26 e' giusta e serve — ma le do il nome di
-- quello che e', perche' `squadra` accanto a `stagione` si legge in un modo
-- solo, e quel modo e' sbagliato.
drop view if exists public.statistiche_serie_a;

alter table caprera.statistiche_serie_a rename column squadra to squadra_oggi;

comment on column caprera.statistiche_serie_a.squadra_oggi is
  'NON e'' la squadra di quella stagione: e'' quella del giorno in cui il foglio e'' stato scaricato, uguale su tutte le stagioni dello stesso giocatore. Valorizzata solo per 2024-25 e 2025-26, dove il foglio era fresco.';

create view public.statistiche_serie_a
with (security_invoker = on) as
select stagione, calciatore, nome, ruolo, squadra_oggi,
       fm, mv, presenze, ammonizioni, espulsioni, assist, gol,
       rigori, rigori_sbagliati, gol_subiti, rigori_parati, imbattuto,
       altro_campionato
from caprera.statistiche_serie_a;

grant select on public.statistiche_serie_a to anon, authenticated;
