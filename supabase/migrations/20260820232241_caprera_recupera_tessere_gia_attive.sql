-- Chi si era gia' tesserato prima che esistessero gli incarichi non ha nessuna
-- assegnazione, e da quando `vede_tutto()` legge le assegnazioni si e' trovato
-- senza i poteri che la sua tessera dichiarava. Qui si rimette in pari il
-- passato: la colonna `ruolo` della tessera resta la fonte, le assegnazioni
-- sono la conseguenza.

-- 1. la tessera di chi era gia' presidenza porta l'incarico presidenza
update caprera.tessere
   set incarichi = array_append(incarichi, 'presidenza')
 where ruolo = 'presidenza' and not ('presidenza' = any(incarichi));

-- 2. ogni tessera gia' usata riceve le assegnazioni che le spettano
insert into caprera.assegnazioni (utente, incarico)
select u.id, 'mister'
  from caprera.tessere t join auth.users u on lower(u.email) = t.email
on conflict do nothing;

insert into caprera.assegnazioni (utente, incarico)
select u.id, i
  from caprera.tessere t
  join auth.users u on lower(u.email) = t.email
  cross join lateral unnest(t.incarichi) as i
on conflict do nothing;

-- 3. e la sua scheda, vuota tranne il nome che la Presidenza aveva scritto
insert into caprera.schede (utente, nome)
select u.id, t.nome
  from caprera.tessere t join auth.users u on lower(u.email) = t.email
on conflict (utente) do nothing;
