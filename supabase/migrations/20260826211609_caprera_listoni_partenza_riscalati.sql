-- «Quei listoni danno sempre in perdita.» - La Presidenza, e ha ragione lei.
--
-- Il controllo che lo mostra e' dentro la stagione stessa: prendo gli stessi giocatori
-- nel listone di settembre e in quello di maggio e guardo il rapporto mediano. In una
-- stagione sana fa 1,000 - la maggior parte dei giocatori a maggio vale quello che
-- valeva a settembre, e chi sale compensa chi scende. Il conto per stagione:
--
--   2020-21  +15,9%   mediana 1,000
--   2021-22  +21,1%   mediana 1,095
--   2022-23   -8,9%   mediana 0,780   <-- sbilanciata
--   2023-24  -38,5%   mediana 0,600   <-- rotta
--   2024-25   +6,9%   mediana 1,000
--   2025-26   +7,4%   mediana 1,000
--
-- Il 2023-24 fa perdere il 38% a chiunque, sempre, chiunque sia in rosa: non e' un
-- giudizio sul mercato, e' una scala sbagliata. E la mediana dice 0,600 esatto, che e'
-- il numero che la Presidenza aveva in testa senza aver fatto il conto.
--
-- Che siano i listoni di settembre e non quelli di maggio lo dice l'incrocio fra
-- stagioni: il listone di maggio di un anno confrontato con quello di settembre del
-- successivo sta fra 0,96 e 1,17, cioe' i «fine» sono in fila fra loro. Sono i due
-- «partenza» che vengono da un file diverso, ed e' li' che si e' persa la scala.
--
-- Applico il fattore misurato: 0,78 al 2022-23 (che si somma allo 0,55 gia' dato, per
-- un netto 0,43 sul file originale) e 0,60 al 2023-24. Il minimo resta 1: un giocatore
-- quotato non puo' valere zero.
update caprera.listone set prezzo = greatest(1, round(prezzo * 0.78)::int)
 where stagione='2022-23' and momento='partenza';

update caprera.listone set prezzo = greatest(1, round(prezzo * 0.60)::int)
 where stagione='2023-24' and momento='partenza';
