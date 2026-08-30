-- Stesso lavoro in due tempi di ieri, e stavolta lo faccio subito: le colonne
-- nuove servono anche alla vista, se no la pagina scrive «250 di base» anche
-- nel 2022-23, quando la dote era 253. In coda, per non buttare la vista.
create or replace view public.finanze_mie
with (security_invoker = true) as
select stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp,
       base, assicurazione
  from caprera.finanze;
