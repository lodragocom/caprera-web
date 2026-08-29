-- «Le finestre di mercato, dai DPCM leggi.» - E i DPCM le scrivono con l'ora esatta.
-- Non era una cosa da dedurre dal campo: era una cosa da leggere. Sono qui, con la
-- riga del regolamento da cui vengono, cosi' chi le usa puo' risalire alla fonte.
create table if not exists caprera.finestre (
  id        bigint generated always as identity primary key,
  stagione  text not null references caprera.stagioni(id) on delete cascade,
  tipo      text not null check (tipo in ('scambi','asta','svincoli')),
  apre      timestamptz,
  chiude    timestamptz,
  etichetta text not null,
  fonte     text not null
);

comment on table caprera.finestre is
  'Le finestre di mercato come le scrivono i DPCM del Regolamento, con la riga di origine.';

create or replace view public.finestre with (security_invoker = true) as
select id, stagione, tipo, apre, chiude, etichetta, fonte from caprera.finestre;
grant select on public.finestre to anon, authenticated;

insert into caprera.finestre (stagione, tipo, apre, chiude, etichetta, fonte)
values
 ('2021-22','svincoli','2021-11-07 00:00+01','2021-11-21 23:59+01',
  'Finestra di novembre: 2 calciatori svincolabili', 'Regolamento 2021-22'),
 ('2022-23','scambi','2022-09-01 07:00+02','2022-09-07 23:59+02',
  'Finestra Mercato Scambi', 'DPCM 2022-23, punto 1'),
 ('2022-23','asta','2023-02-02 20:00+01', null,
  'Asta di riparazione, 1a settimana di febbraio', 'DPCM 2022-23, punto 5'),
 ('2022-23','scambi','2023-02-01 00:00+01','2023-02-03 23:59+01',
  'Mercato Scambi di febbraio', 'DPCM 2022-23, punto 5b'),
 ('2023-24','scambi','2023-09-05 07:00+02','2023-09-08 20:00+02',
  'Finestra Mercato Scambi', 'DPCM 2023-24, punto 1'),
 ('2023-24','scambi','2023-09-12 07:00+02','2023-09-14 22:00+02',
  'Seconda finestra Mercato Scambi', 'DPCM 2023-24, punto 5'),
 ('2023-24','asta','2024-02-01 20:30+01', null,
  'Asta di riparazione', 'DPCM 2023-24, punto 6a'),
 ('2023-24','scambi','2024-01-30 00:00+01','2024-02-02 12:00+01',
  'Mercato Scambi di febbraio', 'DPCM 2023-24, punto 6b'),
 ('2024-25','scambi','2024-09-03 07:00+02','2024-09-08 20:00+02',
  'Finestra Mercato Scambi', 'DPCM 2024-25, punto 2'),
 ('2024-25','scambi','2024-09-11 07:00+02','2024-09-13 22:00+02',
  'Seconda finestra Mercato Scambi', 'DPCM 2024-25, punto 5'),
 ('2024-25','asta','2025-02-05 20:30+01', null,
  'Asta di riparazione', 'DPCM 2024-25, punto 6a'),
 ('2024-25','scambi','2025-02-01 00:00+01','2025-02-04 23:59+01',
  'Mercato Scambi di febbraio', 'DPCM 2024-25, punto 6b'),
 ('2025-26','scambi','2025-09-03 07:00+02','2025-09-08 20:00+02',
  'Finestra Mercato Scambi', 'DPCM 2025-26, punto 2'),
 ('2025-26','scambi','2025-09-11 07:00+02','2025-09-12 22:00+02',
  'Seconda finestra Mercato Scambi', 'DPCM 2025-26, punto 6')
on conflict do nothing;

-- La prova che le date sono quelle giuste: il contratto di scambio fra Prosecco e
-- Armata Rossa per Lukaku e Vlahovic e' datato 13 settembre 2024, e la seconda
-- finestra scambi del 2024-25 va dall'11 al 13 settembre 2024 alle 22. Il documento
-- cade dentro la finestra, all'ultimo giorno utile. Nessuno dei due l'aveva detto
-- all'altro: si sono trovati.
