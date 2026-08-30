-- 1. Il documento. Uno solo, per ora: il contratto depositato il 13.09.2024.
insert into caprera.passaggi (stagione, calciatore, nome, da, a, tipo, finestra, certezza, fonte, nota)
values
 ('2024-25', 2099, 'Lukaku',   'prosecco', 'armata-rossa', 'scambio', 'settembre', 'documento',
  'contratto 13.09.2024', 'Contratto di Scambio Ufficiale, Zurigo-Siena, depositato in segreteria: senza compensazioni monetarie'),
 ('2024-25', 1816, 'Vlahovic', 'armata-rossa', 'prosecco', 'scambio', 'settembre', 'documento',
  'contratto 13.09.2024', 'Contratto di Scambio Ufficiale, Zurigo-Siena, depositato in segreteria: senza compensazioni monetarie')
on conflict do nothing;

-- 2. Gli scambi che si leggono nel foglio: la societa' paga il giocatore, e a maggio il
--    giocatore e' di un'altra. La rosa di partenza lo conferma con il costo 1, che e' il
--    segno di chi arriva per scambio e non per chiamata.
insert into caprera.passaggi (stagione, calciatore, nome, da, a, tipo, certezza, fonte, nota)
select m.stagione, m.calciatore, m.voce, m.societa, f.societa, 'scambio', 'foglio', 'foglio rose',
       'pagato ' || (-m.crediti) || ' crediti dalla societa che poi non lo ha in rosa a maggio'
  from caprera.movimenti m
  join caprera.rose f on f.stagione=m.stagione and f.calciatore=m.calciatore and f.momento='fine'
 where m.categoria='mercato' and m.crediti < 0 and f.societa <> m.societa
   and not exists (select 1 from caprera.rose r
                    where r.stagione=m.stagione and r.societa=m.societa and r.calciatore=m.calciatore)
on conflict do nothing;

-- 3. La plusvalenza di Lautaro: contratto scaduto, clausola pagata da un'altra societa'.
insert into caprera.passaggi (stagione, calciatore, nome, da, a, tipo, certezza, fonte, nota)
values ('2025-26', 1747, 'Martinez L.', 'disperata', 'sanguemisto', 'scambio', 'foglio', 'foglio rose',
        'contratto disperata 2020-21/2024-25 con clausola 110; plusvalenza di 66 crediti registrata dalla Disperata')
on conflict do nothing;
