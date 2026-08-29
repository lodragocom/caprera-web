-- =====================================================================
--  Le statistiche di Serie A, che sono un'altra cosa da quelle di Caprera
--
--  In archivio finora c'erano due misure di un calciatore:
--
--    `v_carriera`  quello che ha fatto **per te**: le partite in cui il tuo
--                  mister l'ha schierato, e i bonus presi in quelle.
--    `rose.mv/fm`  la media voto e la fantamedia di Serie A, tre numeri per
--                  giocatore e nient'altro.
--
--  Questa tabella e' la terza: **tutto quello che ha fatto in Serie A**, a
--  prescindere da chi l'aveva in rosa. Gol, assist, rigori segnati e
--  sbagliati, ammonizioni, espulsioni, gol subiti, rigori parati, porte
--  inviolate. E quattro medie diverse, perche' i voti li danno in quattro:
--  Fantapazz, Gazzetta, Corriere dello Sport e il voto statistico.
--
--  Serve a due cose che oggi non si possono fare:
--
--  1. I **52 usciti** del 2025-26 non hanno statistiche di Serie A, perche'
--     l'archivio le prende dalla riga di rosa e loro a maggio una riga non
--     ce l'hanno. Qui invece ci sono, perche' questa tabella non passa dalle
--     rose.
--  2. Distinguere «ha segnato poco» da «l'hai schierato poco». Suzuki nel
--     2024-25 ha giocato 37 partite di Serie A e il Real Monghi l'ha messo in
--     campo sette volte: sono due numeri diversi e adesso ci sono tutti e due.
--
--  `fantapazz_id` e' l'identificativo del loro export. Lo teniamo perche' e'
--  l'unica chiave stabile che hanno i loro file: il nome no, come si e' visto
--  con Fofana, Bastoni e gli altri omonimi.
-- =====================================================================
create table if not exists caprera.statistiche_serie_a (
  id                bigserial primary key,
  stagione          text not null references caprera.stagioni(id),
  fantapazz_id      integer,
  calciatore        integer references caprera.calciatori(id),
  nome              text not null,
  ruolo             char(1) not null check (ruolo in ('P','D','C','A')),
  squadra           text,
  fm                numeric(4,2),   mv                numeric(4,2),
  fm_gazzetta       numeric(4,2),   mv_gazzetta       numeric(4,2),
  fm_corriere       numeric(4,2),   mv_corriere       numeric(4,2),
  fm_statistico     numeric(4,2),   mv_statistico     numeric(4,2),
  presenze          integer,
  ammonizioni       integer,        espulsioni        integer,
  assist            integer,        gol               integer,
  rigori            integer,        rigori_sbagliati  integer,
  gol_subiti        integer,        rigori_parati     integer,
  imbattuto         integer
);

alter table caprera.statistiche_serie_a
  drop constraint if exists statistiche_serie_a_chiave;
alter table caprera.statistiche_serie_a
  add constraint statistiche_serie_a_chiave unique (stagione, fantapazz_id);

create index if not exists statistiche_serie_a_calciatore
  on caprera.statistiche_serie_a (calciatore);

comment on table caprera.statistiche_serie_a is
  'Statistiche di Serie A per stagione, dagli export di Fantapazz. Non sono '
  'le statistiche di Caprera: qui c''e'' tutto quello che il giocatore ha '
  'fatto in campionato, anche nelle partite in cui nessun mister l''ha '
  'schierato.';

comment on column caprera.statistiche_serie_a.mv is
  'Media voto secondo Fantapazz. Le altre tre coppie sono Gazzetta, Corriere '
  'dello Sport e voto statistico: quattro redazioni, quattro numeri.';

-- La finestra pubblica: le statistiche di Serie A non sono un dato riservato.
create or replace view public.statistiche_serie_a as
  select stagione, calciatore, nome, ruolo, squadra,
         fm, mv, presenze, ammonizioni, espulsioni, assist, gol,
         rigori, rigori_sbagliati, gol_subiti, rigori_parati, imbattuto
    from caprera.statistiche_serie_a;
