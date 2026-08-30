-- Una rosa trascritta da un foglio e una rosa ricostruita non sono la stessa cosa, e
-- da adesso la tabella lo dice invece di lasciarlo capire. Le righe che c'erano prima
-- vengono tutte da un file, e restano marcate cosi'.
alter table caprera.rose add column if not exists fonte text;
update caprera.rose set fonte = 'foglio' where fonte is null;
comment on column caprera.rose.fonte is
  'foglio = trascritta da un file; campo = ricostruita dalle formazioni, con il margine di errore che questo comporta.';

create or replace view public.rose with (security_invoker = true) as
select id, stagione, societa, calciatore, nome, ruolo, club, costo, presenze, mv, fm, momento, fonte
  from caprera.rose;
