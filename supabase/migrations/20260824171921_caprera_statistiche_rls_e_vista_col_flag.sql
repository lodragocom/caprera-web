-- Due buchi che avevo lasciato aperti creando la tabella.

-- 1) Era l'unica tabella dello schema senza RLS. I dati sono pubblici come il
--    listone, ma "pubblici" e "senza serratura" non sono la stessa cosa: la
--    lettura la si concede, non la si dimentica.
alter table caprera.statistiche_serie_a enable row level security;
drop policy if exists leggono_tutti on caprera.statistiche_serie_a;
create policy leggono_tutti on caprera.statistiche_serie_a for select using (true);

-- 2) La vista pubblica non portava `altro_campionato`: dal di fuori le 145
--    righe di chi giocava in serie B o all'estero tornavano mescolate a quelle
--    di Serie A, e il tranello che avevo appena chiuso sulla tabella si
--    riapriva un piano piu' su. Ora c'e' la colonna, e c'e' security_invoker
--    come su tutte le altre viste.
create or replace view public.statistiche_serie_a
with (security_invoker = on) as
select stagione, calciatore, nome, ruolo, squadra,
       fm, mv, presenze, ammonizioni, espulsioni, assist, gol,
       rigori, rigori_sbagliati, gol_subiti, rigori_parati, imbattuto,
       altro_campionato
from caprera.statistiche_serie_a;

grant select on public.statistiche_serie_a to anon, authenticated;
