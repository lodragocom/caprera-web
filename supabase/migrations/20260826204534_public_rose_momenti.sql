-- Come listone_momenti, e per lo stesso motivo: il sito non deve avere scritto
-- dentro l'elenco delle stagioni che hanno la rosa di settembre, perche' quella
-- frase invecchia. Qui c'e' anche la fonte, cosi' la pagina puo' dire da sola
-- quali rose vengono da un foglio e quali sono ricostruite dal campo.
create or replace view public.rose_momenti with (security_invoker = true) as
select stagione, momento, fonte, count(*)::int righe
  from caprera.rose group by stagione, momento, fonte;

grant select on public.rose_momenti to anon, authenticated;
