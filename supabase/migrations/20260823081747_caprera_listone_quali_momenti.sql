-- Quali stagioni hanno quale listone: dodici righe invece di ottomila.
--
-- Serve al sito per dire una cosa vera senza scriversela addosso. La scheda
-- che spiega i due listoni nominava le stagioni a mano — «l'unica che li ha
-- tutti e due e' il 2025-26» — e il giorno in cui ne sono entrate altre due
-- quella frase e' diventata falsa senza che niente si rompesse. Una frase
-- falsa che non rompe niente e' il difetto peggiore che ci sia: non lo trova
-- nessuno.
create or replace view public.listone_momenti
  with (security_invoker = on) as
  select distinct stagione, momento
    from caprera.listone;

comment on view public.listone_momenti is
  'Quali stagioni hanno il listone di partenza e quali quello di fine. '
  'Il sito la legge per non doversi scrivere in pagina l''elenco delle stagioni.';

grant select on public.listone_momenti to anon, authenticated;
