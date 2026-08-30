-- Le diciotto righe rimaste senza scheda non erano nomi sconosciuti: erano nomi con
-- il ruolo diverso fra rosa e anagrafe - Lazzari difensore in anagrafe e centrocampista
-- in rosa, e cosi' via. Il foglio della Serie A della stessa stagione scrive i nomi
-- identici a quelli della rosa e ha gia' la scheda attaccata: passo da li'.
update caprera.rose r set calciatore = s.calciatore
  from caprera.statistiche_serie_a s
 where r.stagione='2020-21' and r.momento='partenza' and r.calciatore is null
   and s.stagione='2020-21' and s.calciatore is not null
   and regexp_replace(lower(s.nome),'[^a-z]','','g') = regexp_replace(lower(r.nome),'[^a-z]','','g')
   and not exists (select 1 from caprera.rose x
                    where x.stagione=r.stagione and x.societa=r.societa
                      and x.momento='partenza' and x.calciatore=s.calciatore);
