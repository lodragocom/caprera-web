-- Avevo lasciato Ferrari e Carboni senza scheda perche' nell'anagrafe ce ne sono
-- due per ciascuno e il file d'asta scrive solo il cognome. Non volevo indovinare.
-- Il campo ha risposto senza che glielo chiedessi:
--
--   Carboni A. schierato dal Roburro   dalla 4a alla 18a, quindici volte
--   Ferrari G. schierato dallo Smit    dalla 4a alla 18a, quattordici volte
--
-- e sono esattamente le due societa' che nel file lasciano libero un «Carboni» e
-- un «Ferrari». Chi gioca quindici partite con quella maglia e' quello in rosa.
update caprera.rose set calciatore = 2154, nome = 'Carboni A.'
 where stagione='2022-23' and momento='partenza' and societa='roburro' and nome='Carboni';

update caprera.rose set calciatore = 1168, nome = 'Ferrari G.'
 where stagione='2022-23' and momento='partenza' and societa='smit' and nome='Ferrari';
