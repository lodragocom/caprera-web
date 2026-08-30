-- Venticinque calciatori che giocavano in Caprera e nell'anagrafe non c'erano.
-- Quasi tutti terzi portieri — Aldegani, Lobont, Marson, Posavec, Rubinho, Zima —
-- gente comprata a un credito per riempire la casella e mai schierata. Le loro
-- righe di rosa restavano senza scheda, e nel sito comparivano come nomi nudi.
--
-- Non e' inventare: ognuno di questi ha una riga nel foglio della Serie A di
-- Fantapazz con quel nome e quel ruolo. Si trascrive quello che c'e' gia'.
--
-- Restano fuori apposta sette nomi dove la scheda **forse** c'e' gia' sotto
-- un'altra grafia, e sceglierlo io sarebbe indovinare:
--   Berisha ↔ Berisha E. · Conti A. ↔ Conti · Di Gennaro R. ↔ Di Gennaro
--   Donnarumma A. ↔ Donnarumma Ant. · Milinkovic Savic ↔ Milinkovic S.
--   Milinkovic Savic V. ↔ Milinkovic · Traore H. ↔ Traore
-- E resta fuori Troost Ekong, che in Caprera ha giocato ma nel foglio di quella
-- stagione non ha riga: senza riga non ho niente da trascrivere.
with da_creare as (
  select distinct o.nome, o.ruolo
  from (select distinct nome, ruolo from caprera.rose where calciatore is null) o
  where not exists (
    select 1 from caprera.calciatori c where c.ruolo = o.ruolo
      and (c.nome = split_part(o.nome,' ',1)
           or c.nome like split_part(o.nome,' ',1)||' %'
           or o.nome like c.nome||' %'))
    and exists (select 1 from caprera.statistiche_serie_a t
                where t.nome = o.nome and t.ruolo = o.ruolo and not t.altro_campionato)
), numerati as (
  select nome, ruolo,
         (select max(id) from caprera.calciatori) + row_number() over (order by nome) as id
  from da_creare
)
insert into caprera.calciatori (id, nome, ruolo)
select id, nome, ruolo from numerati;

-- Agganciate le righe di rosa che restavano orfane.
update caprera.rose r
   set calciatore = c.id
  from caprera.calciatori c
 where r.calciatore is null and c.nome = r.nome and c.ruolo = r.ruolo
   and (select count(*) from caprera.calciatori c2 where c2.nome=r.nome and c2.ruolo=r.ruolo) = 1;

-- E le righe del foglio, che erano orfane per la stessa ragione.
update caprera.statistiche_serie_a s
   set calciatore = c.id
  from caprera.calciatori c
 where s.calciatore is null and not s.altro_campionato
   and c.nome = s.nome and c.ruolo = s.ruolo
   and (select count(*) from caprera.calciatori c2 where c2.nome=s.nome and c2.ruolo=s.ruolo) = 1
   and not exists (select 1 from caprera.statistiche_serie_a t
                   where t.stagione = s.stagione and t.calciatore = c.id);
