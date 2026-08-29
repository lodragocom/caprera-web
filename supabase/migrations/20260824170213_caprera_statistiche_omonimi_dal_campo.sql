-- Le schede di Serie A di Colombo, Fofana, Pavlovic, Pedro, Orsolini, Diao, Odgaard,
-- Yeboah e Furlanetto arrivavano senza id: nel foglio quel cognome non basta a dire chi sia.
-- Non lo decido io: lo decide chi e' sceso in campo per una societa' di Caprera con quel
-- cognome e quel ruolo in quella stagione. Aggancio solo dove il dato di partita e' univoco.
with dal_campo as (
  select p.stagione, g.nome, g.ruolo, array_agg(distinct g.calciatore) ids
  from caprera.formazione_giocatori g
  join caprera.formazioni f on f.id = g.formazione
  join caprera.partite p on p.id = f.partita
  where p.stagione in ('2024-25','2025-26')
    and g.calciatore is not null and g.voto is not null
  group by 1,2,3
)
update caprera.statistiche_serie_a s
   set calciatore = d.ids[1]
  from dal_campo d
 where s.calciatore is null
   and d.stagione = s.stagione and d.nome = s.nome and d.ruolo = s.ruolo
   and array_length(d.ids,1) = 1;

-- Furlanetto 2024-25 in Caprera non e' mai sceso in campo, quindi il campo non parla.
-- Ma nel 2025-26 lo stesso portiere della Lazio e' agganciato dal campo: e' lui.
update caprera.statistiche_serie_a s
   set calciatore = (select s2.calciatore from caprera.statistiche_serie_a s2
                     where s2.stagione='2025-26' and s2.nome='Furlanetto' and s2.ruolo='P'
                       and s2.calciatore is not null)
 where s.stagione='2024-25' and s.nome='Furlanetto' and s.ruolo='P' and s.calciatore is null;
