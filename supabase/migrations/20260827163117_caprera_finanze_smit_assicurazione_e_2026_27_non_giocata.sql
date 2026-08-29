-- Due correzioni sulla riga del 2026-27, tutte e due mie.
--
-- 1. Lo Smit. Avevo letto una colonna sola e ce n'erano due: nel foglio la
--    voce «Assicurazioni» (+8, un incasso) e' separata dall'«Assicurazione
--    Obbligatoria» (-2, un addebito che tocca tutti). Avevo preso solo la
--    seconda, e infatti 250+1+15-2 faceva 264 mentre il foglio dice 272.
--    Con tutte e due, +8-2 = +6, il conto torna: 250+1+15+6 = 272.
--    E' l'unica societa' con la voce piena, in tutte e due le stagioni -
--    nel 2024-25 la aveva a -5.
update caprera.finanze set assicurazione = 6
 where stagione='2026-27' and societa='smit';

-- 2. `spesi`, `scambi` e `residui` sono NOT NULL DEFAULT 0, quindi la riga di
--    una stagione non giocata dice «ha speso zero» invece di «non lo sappiamo
--    ancora». Sono due cose diverse e il sito non puo' distinguerle. Si
--    rendono annullabili e si svuotano per il 2026-27: l'asta non c'e' stata.
alter table caprera.finanze alter column spesi   drop not null;
alter table caprera.finanze alter column scambi  drop not null;
alter table caprera.finanze alter column residui drop not null;
alter table caprera.finanze alter column spesi   drop default;
alter table caprera.finanze alter column scambi  drop default;
alter table caprera.finanze alter column residui drop default;

comment on column caprera.finanze.spesi is
 'I crediti spesi all''asta di settembre - identico alla somma dei costi della rosa di partenza, verificato su tutte le stagioni che ce l''hanno. NULL dove l''asta non si e ancora fatta: zero vorrebbe dire «non ha speso niente».';

update caprera.finanze set spesi = null, scambi = null, residui = null
 where stagione='2026-27';
