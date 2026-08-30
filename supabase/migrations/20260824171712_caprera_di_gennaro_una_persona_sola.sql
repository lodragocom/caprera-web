-- Di Gennaro e' il portiere dell'Inter, uno solo: nel 2025-26 ha giocato l'ultima di
-- campionato. In archivio esisteva due volte perche' il foglio del 2024-25 lo scriveva
-- "Di Gennaro R." e quella grafia si era aperta una scheda sua (3913), senza mai una
-- presenza. Le due schede non si sovrappongono in nessuna stagione: e' un raddoppio di
-- identita', non due persone. Confermato dalla Presidenza.
-- La grafia vecchia resta viva come alias, cosi' chi cerca "Di Gennaro R." lo trova.
insert into caprera.calciatori_nomi (calciatore, nome)
select 1211, 'Di Gennaro R.'
where not exists (select 1 from caprera.calciatori_nomi where calciatore=1211 and nome='Di Gennaro R.');

update caprera.rose set calciatore = 1211 where calciatore = 3913;

delete from caprera.calciatori where id = 3913;
