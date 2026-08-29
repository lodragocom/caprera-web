-- La colonna l'avevo aggiunta a caprera.rose e mi ero fermato li'. Il sito
-- non legge la tabella: legge la vista public.rose, che ha le colonne scritte
-- a mano una per una. Risultato «column rose.costo_stimato does not exist», e
-- con quell'errore sono cadute anche la pagina Asta e la Mia Rosa, perche'
-- tutte e due passano da roseStagione. Aggiungere una colonna a una tabella
-- con una vista davanti e' un lavoro in due tempi, e ne avevo fatto uno solo.
--
-- Va in fondo, non accanto a `costo`: create or replace non sa spostare le
-- colonne, sa solo aggiungerne in coda. E in coda si aggiunge senza dover
-- buttare la vista, quindi senza toccare permessi e policy.
create or replace view public.rose
with (security_invoker = true) as
select id, stagione, societa, calciatore, nome, ruolo, club,
       costo, presenze, mv, fm, momento, fonte,
       costo_stimato
  from caprera.rose;
