-- Cinquantasei righe di rosa senza calciatore, agganciate passando dal foglio
-- della Serie A. Funziona perche' le rose e il foglio scrivono i nomi allo stesso
-- modo — «Zapata D.», «Conti A.», «Rodriguez R.» — mentre l'anagrafe li tiene
-- corti. Il ponte non e' il nome: e' che quella riga del foglio ha gia' un
-- calciatore agganciato, verificato a suo tempo.
--
-- La prova sono le presenze: per tutte e cinquantasei il numero in rosa e quello
-- sul foglio combaciano **esattamente**. Zero discordanze. E' la stessa prova che
-- ha sciolto Bastoni, ripetuta cinquantasei volte.
--
-- Si aggancia solo dove la corrispondenza e' una sola (stagione + nome + ruolo) e
-- dove non si creerebbe un doppione nella stessa rosa: verificato, zero e zero.
-- Chi non ha una riga sul foglio, o ce l'ha ma nemmeno quella e' agganciata,
-- resta fuori apposta: sono calciatori che nell'anagrafe non esistono ancora, e
-- inventargli una scheda non e' un aggancio, e' un'invenzione.
update caprera.rose r
   set calciatore = s.calciatore
  from caprera.statistiche_serie_a s
 where r.calciatore is null
   and s.stagione = r.stagione
   and s.nome = r.nome
   and s.ruolo = r.ruolo
   and not s.altro_campionato
   and s.calciatore is not null
   and r.presenze is not distinct from s.presenze;
