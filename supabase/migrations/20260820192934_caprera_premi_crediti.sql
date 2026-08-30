-- I premi in crediti, calcolati e non trascritti.
--
-- I valori NON stanno qui dentro: si leggono da lega.regole, che e'
-- regole-caprera.json messo nel database. Se la Presidenza cambia un premio,
-- si cambia il regolamento e questa vista lo segue. Scriverli nel codice
-- avrebbe significato averli in due posti e vederli divergere.

-- Classifica marcatori: le societa' ordinate per gol fatti in campionato.
-- Il regolamento parla di "capocannoniere" con premi al primo e al secondo e
-- penalita' a penultimo e ultimo: dieci posizioni, quindi e' la graduatoria
-- delle societa', non il singolo calciatore. DA CONFERMARE.
create or replace view caprera.v_classifica_marcatori
with (security_invoker = on) as
  select stagione, societa, sum(gol_fatti) as gol,
         rank() over (partition by stagione order by sum(gol_fatti) desc) as posizione,
         count(*) over (partition by stagione) as squadre
    from caprera.v_gare
   where competizione = 'campionato' and giocata
   group by stagione, societa;

create or replace view caprera.v_premi_crediti
with (security_invoker = on) as
with r as (select regole from caprera.lega where id = 'caprera'),
fp as (
  select f.stagione, f.societa, f.posizione,
         coalesce(((select regole from r) #>> array['crediti','premi','fantapunti',
                    f.posizione::text])::numeric, 0) as crediti
    from caprera.v_classifica_fantapunti f
),
mc as (
  select m.stagione, m.societa, m.posizione, m.squadre,
         case
           when m.posizione = m.squadre     then ((select regole from r)
                  #>> array['crediti','premi','capocannoniere','ultimo'])::numeric
           when m.posizione = m.squadre - 1 then ((select regole from r)
                  #>> array['crediti','premi','capocannoniere','penultimo'])::numeric
           else coalesce(((select regole from r) #>> array['crediti','premi',
                  'capocannoniere', m.posizione::text])::numeric, 0)
         end as crediti
    from caprera.v_classifica_marcatori m
)
select coalesce(fp.stagione, mc.stagione) as stagione,
       coalesce(fp.societa,  mc.societa)  as societa,
       fp.posizione as pos_fantapunti,
       coalesce(fp.crediti, 0) as crediti_fantapunti,
       mc.posizione as pos_marcatori,
       coalesce(mc.crediti, 0) as crediti_marcatori,
       coalesce(fp.crediti, 0) + coalesce(mc.crediti, 0) as crediti_calcolati
  from fp full join mc on mc.stagione = fp.stagione and mc.societa = fp.societa;
