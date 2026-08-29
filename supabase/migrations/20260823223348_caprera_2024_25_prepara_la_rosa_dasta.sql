-- =====================================================================
--  2024-25 · si prepara il terreno per la rosa d'asta
--
--  Tre cose piccole prima delle 310 righe:
--
--  a) Moretta (Parma) e Di Gennaro R. (Inter) sono terzi portieri mai scesi
--     in campo, in rosa senza una scheda calciatore. Create, come Toniolo e
--     Nava per il 2025-26.
--  b) Cragno era senza club. E' il terzo portiere del Monza dell'Aston
--     Ville: lo dice l'aritmetica — i due blocchi-portiere dell'Aston Ville
--     costano 13 sul foglio d'asta, e 10 (Torino) + 2 (Monza) + 1 fa 13 solo
--     contando Cragno nel Monza.
--  c) Si svuota la rosa di partenza del 2024-25, che non c'era.
-- =====================================================================
insert into caprera.calciatori (id, nome, ruolo) values
  (3912, 'Moretta', 'P'), (3913, 'Di Gennaro R.', 'P')
  on conflict (id) do nothing;

update caprera.rose set calciatore = 3912
  where stagione='2024-25' and momento='fine' and nome='Moretta' and calciatore is null;
update caprera.rose set calciatore = 3913
  where stagione='2024-25' and momento='fine' and nome='Di Gennaro R.' and calciatore is null;

update caprera.rose set club='MON'
  where stagione='2024-25' and momento='fine' and nome='Cragno' and club is null;

delete from caprera.rose where stagione='2024-25' and momento='partenza';
