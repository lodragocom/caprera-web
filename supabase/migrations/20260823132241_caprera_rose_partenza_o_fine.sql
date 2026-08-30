-- La rosa ha due momenti, come il listone.
--
--   partenza = la rosa uscita dall'asta, prima della prima giornata
--   fine     = la rosa a fine stagione, dopo il mercato di gennaio
--
-- Fino a oggi `rose` teneva un solo momento e non diceva quale. Era la rosa di
-- fine anno, ma non c'era scritto da nessuna parte: si e' scoperto contando
-- quanti giocatori una societa' aveva schierato prima di dicembre e vedendo che
-- non erano gli stessi. Un dato che non dice di che giorno e' costringe chi lo
-- legge a indovinare, e prima o poi qualcuno indovina male.
--
-- Il default e' 'fine' perche' e' quello che le righe di adesso sono davvero:
-- nessuna riga cambia significato, ne guadagna uno.

alter table caprera.rose
  add column if not exists momento text not null default 'fine';

alter table caprera.rose drop constraint if exists rose_momento_check;
alter table caprera.rose
  add constraint rose_momento_check check (momento in ('partenza', 'fine'));

-- La chiave vecchia impediva a un giocatore di stare nella stessa rosa a
-- settembre e a maggio. Adesso deve poterci stare due volte, una per momento.
alter table caprera.rose drop constraint if exists rose_stagione_societa_nome_key;
alter table caprera.rose
  add constraint rose_stagione_societa_momento_nome_key
  unique (stagione, societa, momento, nome);

comment on column caprera.rose.momento is
  'Di che giorno e'' questa rosa: «partenza» = uscita dall''asta, «fine» = dopo '
  'il mercato di gennaio. Chi legge una rosa deve sapere quale sta guardando.';

-- La carriera si conta sulla rosa di fine anno: il costo e la fantamedia che
-- mostra sono quelli. Senza questo filtro ogni giocatore rimasto tutto l'anno
-- comparirebbe due volte.
create or replace view caprera.v_carriera as
 WITH imp AS (
         SELECT fg.id AS gid, fg.calciatore, f.societa, p_1.stagione,
            fg.titolare, fg.entrato, fg.voto
           FROM caprera.formazione_giocatori fg
             JOIN caprera.formazioni f ON f.id = fg.formazione
             JOIN caprera.partite p_1 ON p_1.id = f.partita
        ), pres AS (
         SELECT imp.calciatore, imp.societa, imp.stagione,
            count(*) AS convocato,
            count(*) FILTER (WHERE imp.titolare) AS titolare,
            count(*) FILTER (WHERE imp.entrato) AS subentrato,
            count(imp.voto) AS con_voto,
            round(avg(imp.voto), 2) AS mv
           FROM imp GROUP BY imp.calciatore, imp.societa, imp.stagione
        ), bon AS (
         SELECT i.calciatore, i.societa, i.stagione,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = ANY (ARRAY['gol'::text, 'rigore'::text])) AS gol,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'rigore'::text) AS rigori,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'rigore-sbagliato'::text) AS rigori_sbagliati,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'rigore-parato'::text) AS rigori_parati,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'assist'::text) AS assist,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'giallo'::text) AS gialli,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'rosso'::text) AS rossi,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'autogol'::text) AS autogol,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'imbattuto'::text) AS imbattuto,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'gol-subito'::text) AS gol_subiti,
            sum(b_1.quante) FILTER (WHERE b_1.bonus = 'gol-vittoria'::text) AS gol_vittoria
           FROM imp i JOIN caprera.formazione_bonus b_1 ON b_1.giocatore = i.gid
          GROUP BY i.calciatore, i.societa, i.stagione
        )
 SELECT p.calciatore, c.nome, c.ruolo, p.stagione, p.societa,
    r.club, r.costo, r.fm,
    p.convocato, p.titolare, p.subentrato, p.con_voto, p.mv,
    COALESCE(b.gol, 0::bigint) AS gol,
    COALESCE(b.rigori, 0::bigint) AS rigori,
    COALESCE(b.rigori_sbagliati, 0::bigint) AS rigori_sbagliati,
    COALESCE(b.rigori_parati, 0::bigint) AS rigori_parati,
    COALESCE(b.assist, 0::bigint) AS assist,
    COALESCE(b.gialli, 0::bigint) AS gialli,
    COALESCE(b.rossi, 0::bigint) AS rossi,
    COALESCE(b.autogol, 0::bigint) AS autogol,
    COALESCE(b.imbattuto, 0::bigint) AS imbattuto,
    COALESCE(b.gol_subiti, 0::bigint) AS gol_subiti,
    COALESCE(b.gol_vittoria, 0::bigint) AS gol_vittoria
   FROM pres p
     JOIN caprera.calciatori c ON c.id = p.calciatore
     LEFT JOIN bon b ON b.calciatore = p.calciatore AND b.societa = p.societa AND b.stagione = p.stagione
     LEFT JOIN caprera.rose r ON r.calciatore = p.calciatore AND r.societa = p.societa
                             AND r.stagione = p.stagione AND r.momento = 'fine';

-- La finestra pubblica porta il momento: il sito deve poter scegliere.
create or replace view public.rose as
  select id, stagione, societa, calciatore, nome, ruolo, club, costo,
         presenze, mv, fm, momento
    from caprera.rose;
