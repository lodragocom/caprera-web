-- ============================================================================
-- Fase 3 — la clausola rescissoria smette di essere un numero che nessuno
-- controlla.
--
-- Il regolamento (§10.5.1, «DPCM Linee Guida CR») dice che la clausola non
-- puo' essere inferiore a una quota del prezzo d'acquisto su Fantapazz:
-- **50% per i difensori, 75% per i centrocampisti, 100% per gli altri** —
-- gli attaccanti non hanno sconto (confermato dai quindici casi del
-- Riscatti_Contratti.xlsx 25-26).
--
-- Finora la clausola si dichiarava per email e il conto non lo faceva
-- nessuno. Orsolini e Krstovic sono passati sotto soglia **senza che niente
-- potesse accorgersene**: non e' stata malafede, e' che non esisteva il
-- controllo. Questa vista e' quel controllo.
--
-- ⚠️ Il prezzo di riferimento e' quello del listone di **partenza** della
-- stagione in cui il contratto e' stato firmato: e' il numero che i mister
-- avevano davanti quando hanno rilanciato (deciso da L0 il 22/08). Il listone
-- di fine guarda al presente e giudicherebbe una scommessa con la moviola.
--
-- ⚠️ E resta aperta la lacuna del 24/08: **il ruolo cambia da una stagione
-- all'altra** su Fantapazz — Orsolini era C nel 2024-25 ed e' A nel 2025-26 —
-- e il regolamento dice quale ruolo vale per il rinnovo, non per la soglia.
-- Qui si usa il ruolo scritto nel contratto, che e' quello del momento in cui
-- e' stato firmato. La colonna `ruolo_listone` mostra l'altro, cosi' i casi in
-- cui i due divergono si vedono invece di nascondersi.
-- ============================================================================

create or replace view caprera.v_conformita_clausole as
with quota(ruolo, parte) as (
  values ('D'::char, 0.50::numeric), ('C', 0.75), ('A', 1.00), ('P', 1.00)
)
select c.id, c.societa, c.nome, c.ruolo, c.dalla, c.alla, c.clausola,
       l.prezzo                        as valore_fp,
       l.ruolo                         as ruolo_listone,
       ceil(l.prezzo * qc.parte)::int  as minimo_ruolo_contratto,
       ceil(l.prezzo * ql.parte)::int  as minimo_ruolo_listone,
       -- Prudente: finche' la lacuna e' aperta si prende la soglia PIU' BASSA
       -- delle due. Dichiarare fuori norma un contratto per una lettura che
       -- nessuno ha ratificato sarebbe peggio del difetto che stiamo cercando.
       least(ceil(l.prezzo * qc.parte), ceil(l.prezzo * ql.parte))::int as minimo,
       (l.ruolo is distinct from c.ruolo) as ruolo_cambiato,
       case
         when l.prezzo   is null then 'senza prezzo'
         when c.clausola is null then 'senza clausola'
         when c.clausola >= least(ceil(l.prezzo * qc.parte), ceil(l.prezzo * ql.parte))
           then 'a norma'
         else 'sotto soglia'
       end as esito,
       case when l.prezzo is not null and c.clausola is not null
            then c.clausola - least(ceil(l.prezzo * qc.parte),
                                    ceil(l.prezzo * ql.parte))::int end as scarto
  from caprera.contratti c
  join quota qc on qc.ruolo = c.ruolo
  -- Il prezzo si aggancia per NOME, non per nome+ruolo: il ruolo su Fantapazz
  -- cambia da una stagione all'altra, e pretenderlo uguale faceva sparire
  -- proprio i casi interessanti — Orsolini, contratto A e listone C, non
  -- veniva trovato affatto. Fra piu' righe si preferisce quella con lo stesso
  -- ruolo, e in mancanza la prima.
  left join lateral (
    select li.prezzo, li.ruolo
      from caprera.listone li
     where li.stagione = c.dalla and li.momento = 'partenza'
       and lower(li.nome) = lower(c.nome)
     order by (li.ruolo = c.ruolo) desc, li.prezzo desc
     limit 1
  ) l on true
  left join quota ql on ql.ruolo = l.ruolo;

comment on view caprera.v_conformita_clausole is
  'Per ogni contratto: il valore Fantapazz di partenza, il minimo di clausola '
  'previsto dal §10.5.1 (D 50%, C 75%, altri 100%) e se la clausola dichiarata '
  'lo rispetta. E'' il controllo che mancava quando la clausola si dichiarava '
  'per email.';

-- La finestra per chi governa. Non entra in `public` per tutti: la clausola e'
-- un dato di contratto, e i contratti non hanno finestra pubblica.
create or replace function public.conformita_clausole()
returns table (
  id bigint, societa text, nome text, ruolo char, dalla text,
  clausola int, valore_fp int, minimo int, esito text, scarto int,
  ruolo_listone char, ruolo_cambiato boolean,
  minimo_ruolo_contratto int, minimo_ruolo_listone int
)
language sql
security definer
set search_path = caprera, public, pg_temp
stable
as $$
  select v.id, v.societa, v.nome, v.ruolo, v.dalla,
         v.clausola, v.valore_fp, v.minimo, v.esito, v.scarto,
         v.ruolo_listone, v.ruolo_cambiato,
         v.minimo_ruolo_contratto, v.minimo_ruolo_listone
    from caprera.v_conformita_clausole v
   where caprera.vede_tutto()
   order by (v.esito = 'sotto soglia') desc, v.dalla desc, v.societa, v.nome;
$$;

revoke all on function public.conformita_clausole() from public, anon;
grant execute on function public.conformita_clausole() to authenticated;
