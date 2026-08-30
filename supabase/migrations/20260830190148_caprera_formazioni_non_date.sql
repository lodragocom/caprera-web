-- ============================================================================
-- `caprera.v_formazioni_non_date` — la penalità che si calcola da sola.
--
-- COME SI RICONOSCE, E PERCHE' NON E' COME SEMBRA
-- ------------------------------------------------
-- Sembrerebbe che una formazione non data sia **l'assenza di una riga**. Non lo
-- e', e il `regole-caprera.json` lo diceva sbagliato fino al 30/08: **Fantapazz
-- tiene la formazione della giornata precedente**. Quindi la riga c'e' — e' il
-- suo `inviata` che non cambia.
--
-- > La formazione non data non e' un'assenza: e' un `inviata` che non cambia.
--
-- Verificato il 24/08 contro il registro di Guido: **7 casi su 7**, con in piu'
-- una giornata che il registro non aveva. E la meta' della prova che di solito
-- nessuno guarda: dove il registro NON ha penalita', il metodo non produce
-- rilevazioni.
--
-- LA SCALA
-- --------
-- `crediti.penalita.formazione-non-data`: **-1** la prima volta, **-3** la
-- seconda, **-5** dalla terza. Gli importi si leggono da `lega.regole`, non
-- stanno qui: regola cambiata = si cambia il JSON e la vista cambia da sola.
--
-- ⚠️ **Si conta DENTRO la stagione** — deciso da L0 il 24/08. Il regolamento
-- dice «1a, 2a, dalla 3a» senza dire dentro cosa.
--
-- ⚠️ **IL LIMITE, e non e' piccolo.** Il metodo e' CIECO SULLA PRIMA GIORNATA
-- giocata: non c'e' una precedente da cui copiare, quindi non c'e' un `inviata`
-- ripetuto da vedere. Almeno un caso su otto sfugge — Roburro 2020-21 ha preso
-- -3, cioe' la seconda infrazione, e se ne rileva una sola. La vista lo
-- dichiara nella colonna `prima_giornata_cieca` invece di far finta che il
-- conteggio sia completo.
-- ============================================================================

create or replace view caprera.v_formazioni_non_date as
with schierate as (
  select p.stagione, f.societa, p.giornata, f.inviata,
         lag(f.inviata) over (partition by p.stagione, f.societa order by p.giornata) as precedente,
         min(p.giornata) over (partition by p.stagione, f.societa) as prima_giocata
    from caprera.formazioni f
    join caprera.partite p on p.id = f.partita
   where p.competizione = 'campionato'
     and p.giornata is not null
     and f.inviata is not null
),
casi as (
  select stagione, societa, giornata, inviata,
         row_number() over (partition by stagione, societa order by giornata) as quante,
         (giornata = prima_giocata) as prima_giornata_cieca
    from schierate
   where inviata = precedente
),
scala as (
  select (ordinalita - 1) as posto, valore::int as crediti
    from caprera.lega,
         lateral jsonb_array_elements_text(regole->'crediti'->'penalita'->'formazione-non-data')
           with ordinality as t(valore, ordinalita)
   where id = 'caprera'
)
select c.stagione, c.societa, c.giornata, c.quante,
       -- oltre la terza la scala non cresce: si resta a -5
       coalesce((select crediti from scala where posto = c.quante - 1),
                (select min(crediti) from scala)) as crediti,
       c.prima_giornata_cieca
  from casi c;

comment on view caprera.v_formazioni_non_date is
  'Le formazioni non date, riconosciute da un `inviata` identico alla giornata '
  'precedente — non dall''assenza di una riga: Fantapazz tiene la formazione '
  'vecchia. Scala -1/-3/-5 letta da lega.regole, contata dentro la stagione. '
  'CIECA sulla prima giornata giocata: non c''e'' una precedente da cui copiare, '
  'e almeno un caso su otto sfugge.';
