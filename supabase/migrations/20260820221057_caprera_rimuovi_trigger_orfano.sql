-- Il trigger di settembre 2025 scriveva in `public.profiles` a ogni
-- registrazione. Quella tabella ora sta in `vecchio_progetto`, quindi il
-- trigger falliva - e siccome girava dentro la registrazione, **faceva
-- fallire la registrazione stessa**: nessun mister sarebbe mai riuscito a
-- farsi la Tessera del Tifoso.
--
-- Non e' un dettaglio di pulizia: era una porta murata. Il trigger si toglie,
-- la funzione si sposta nel vecchio progetto insieme a tutto il resto, cosi'
-- resta leggibile se un giorno serve capire cosa faceva.
drop trigger if exists on_auth_user_created on auth.users;
alter function public.handle_new_user() set schema vecchio_progetto;
