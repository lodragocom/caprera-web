create or replace view public.finanze_mie
with (security_invoker = true) as
select stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp,
       base, assicurazione, giovani
  from caprera.finanze;
