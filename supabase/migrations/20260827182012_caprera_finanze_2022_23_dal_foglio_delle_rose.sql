-- Il foglio delle rose del 2022-23 corregge due cose che avevo scritto io.
--
-- 1. La «base 253» non esiste. La dote e' sempre 250, e quei 3 sono una voce
--    con un nome: **budget giovani**, uguale per tutte e dieci. Avevo visto un
--    +3 uniforme e ne avevo fatto una dote diversa, invece di cercarne il nome.
--
-- 2. Il **Fair Play Finanziario esiste**, vale 2 o 0 a seconda della societa',
--    e la scheda «Crediti» di Guido NON lo contiene: quella si ferma a
--    250 + riporto + giovani. Il foglio delle rose - quello con cui l'asta si
--    e' fatta davvero - arriva a 263 dove Guido dice 261.
--    Ieri avevo azzerato l'ffp del 2024-25 dicendo che «nel registro non
--    c'e'». Non c'era nel registro di Guido. C'e' nel foglio dell'asta.
--
-- La prova: 250 + (riportati+bonus) + giovani + ffp = crediti iniziali,
-- dieci societa' su dieci, e le tre che gia' combaciavano - Disperata,
-- Sanguemisto, Subbuteo - sono esattamente le tre con ffp a zero.
alter table caprera.finanze add column if not exists giovani integer not null default 0;

comment on column caprera.finanze.giovani is
 'Il «budget giovani»: una dote in piu, uguale per tutte le societa, che alcune stagioni hanno e altre no. Nel 2022-23 e nel 2023-24 vale 3. Sta dentro il numero della scheda Crediti di Guido; l''ffp no.';
comment on column caprera.finanze.base is
 'La dote di partenza uguale per tutte: 250, sempre. Le voci che si aggiungono hanno un nome loro - riportati, bonus, giovani, ffp, assicurazione - e nessuna va confusa con la base.';

-- via la base 253: era il budget giovani travestito
update caprera.finanze set base = 250, giovani = 3
 where stagione in ('2022-23','2023-24');

-- il 2022-23, preso dal foglio dell'asta
update caprera.finanze f set iniziali = v.iniziali, ffp = v.ffp
  from (values ('armata-rossa',        259, 2),
               ('aston-ville',         263, 2),
               ('disperata',           291, 0),
               ('prosecco',            263, 2),
               ('real-monghi',         258, 2),
               ('roburro',             258, 2),
               ('sanguemisto',         263, 0),
               ('smit',                265, 2),
               ('sporting-mangiapreti',270, 2),
               ('subbuteo',            259, 0)
       ) as v(societa, iniziali, ffp)
 where f.stagione='2022-23' and f.societa=v.societa;
