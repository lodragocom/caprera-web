-- Le classifiche non si conservano: si calcolano. Tutto quello che si puo'
-- ricavare dalle partite qui e' una vista, cosi' non esiste il caso in cui
-- l'archivio dice una cosa e la classifica un'altra.

-- Ogni partita vista dalle due parti.
create or replace view caprera.v_gare
with (security_invoker = on) as
  select p.id, p.stagione, p.competizione, p.giornata, p.turno,
         p.casa as societa, p.fuori as avversario, true as in_casa,
         p.gol_casa as gol_fatti, p.gol_fuori as gol_subiti,
         p.fp_casa as fantapunti, p.fp_fuori as fantapunti_avversario, p.giocata
    from caprera.partite p
  union all
  select p.id, p.stagione, p.competizione, p.giornata, p.turno,
         p.fuori, p.casa, false,
         p.gol_fuori, p.gol_casa,
         p.fp_fuori, p.fp_casa, p.giocata
    from caprera.partite p;

-- Serve a controllare la classifica in archivio, non a sostituirla.
create or replace view caprera.v_classifica_calcolata
with (security_invoker = on) as
  select stagione, societa,
         count(*)                                             as giocate,
         count(*) filter (where gol_fatti > gol_subiti)       as vinte,
         count(*) filter (where gol_fatti = gol_subiti)       as pari,
         count(*) filter (where gol_fatti < gol_subiti)       as perse,
         sum(gol_fatti)                                       as gol_fatti,
         sum(gol_subiti)                                      as gol_subiti,
         count(*) filter (where gol_fatti > gol_subiti) * 3
           + count(*) filter (where gol_fatti = gol_subiti)   as punti,
         sum(fantapunti)                                      as fantapunti
    from caprera.v_gare
   where competizione = 'campionato' and giocata
   group by stagione, societa;

-- Somma dei fantapunti di campionato SENZA il +1 di chi gioca in casa.
-- Verificata contro la classifica pubblicata da Fantapazz: dieci societa'
-- su dieci allo stesso decimale. Per questo e' una vista e non una tabella.
create or replace view caprera.v_classifica_fantapunti
with (security_invoker = on) as
  select stagione, societa,
         round(sum(fantapunti) - count(*) filter (where in_casa), 2) as fantapunti,
         rank() over (partition by stagione
                      order by sum(fantapunti) - count(*) filter (where in_casa) desc) as posizione
    from caprera.v_gare
   where competizione = 'campionato' and giocata
   group by stagione, societa;

create or replace view caprera.v_albo
with (security_invoker = on) as
  select e.competizione, c.nome as competizione_nome, e.stagione,
         e.vincitore, e.finalista, e.ai_fantapunti
    from caprera.edizioni e
    join caprera.competizioni c on c.id = e.competizione
   where e.vincitore is not null;

create or replace view caprera.v_bacheca
with (security_invoker = on) as
  select vincitore as societa, competizione, competizione_nome, stagione, ai_fantapunti
    from caprera.v_albo
  union all
  select societa, 'campionato', 'Lega Caprera', stagione, false
    from caprera.classifiche where posizione = 1;

create or replace view caprera.v_forma
with (security_invoker = on) as
  select stagione, societa, giornata,
         case when gol_fatti > gol_subiti then 'V'
              when gol_fatti = gol_subiti then 'N'
              else 'P' end as esito,
         gol_fatti, gol_subiti, fantapunti
    from caprera.v_gare
   where competizione = 'campionato' and giocata;

-- La ricerca che oggi non si puo' fare: le formazioni sono quindici mega di
-- file separati per stagione e non c'e' modo di attraversarli.
create or replace view caprera.v_impieghi
with (security_invoker = on) as
  select fg.calciatore, fg.nome, f.societa, p.stagione, p.competizione,
         p.giornata, fg.titolare, fg.entrato, fg.voto, fg.fascia
    from caprera.formazione_giocatori fg
    join caprera.formazioni f on f.id = fg.formazione
    join caprera.partite    p on p.id = f.partita;

create or replace view caprera.v_marcatori
with (security_invoker = on) as
  select fg.calciatore, fg.nome, f.societa, p.stagione,
         sum(fb.quante) as gol
    from caprera.formazione_bonus fb
    join caprera.formazione_giocatori fg on fg.id = fb.giocatore
    join caprera.formazioni f on f.id = fg.formazione
    join caprera.partite    p on p.id = f.partita
   where fb.bonus in ('gol','rigore')
   group by fg.calciatore, fg.nome, f.societa, p.stagione;
