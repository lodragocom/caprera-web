-- La vista sottile per il front end, come le altre. Non c'e' niente di riservato qui
-- dentro: i crediti restano in movimenti, questa tabella dice solo chi e' andato dove.
create or replace view public.passaggi
  with (security_invoker = true) as
select id, stagione, calciatore, nome, da, a, tipo, finestra, certezza, fonte, nota
  from caprera.passaggi;

grant select on public.passaggi to anon, authenticated;
