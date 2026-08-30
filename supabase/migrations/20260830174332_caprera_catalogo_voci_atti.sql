-- ============================================================================
-- Il catalogo delle voci degli atti.
--
-- Finora il motivo si scriveva a mano, e il risultato si vede nell'archivio:
-- **FPF** e **FFP** convivono, «Formazione non data» e «Mancata Formazione»
-- sono la stessa cosa detta in due modi, e c'e' una «Grigliata Serie A1o»
-- senza lo spazio. Sinonimi e refusi non sono un problema estetico: rendono
-- impossibile chiedere al database «quante penalita' per formazione non data
-- abbiamo dato», che e' esattamente il genere di domanda per cui il registro
-- esiste.
--
-- Il catalogo **non e' una lista scritta a mano da me**: nasce dalle voci
-- gia' usate, con l'importo piu' frequente. Cosi' resta vero senza che
-- nessuno debba aggiornarlo, e una voce nuova entra semplicemente usandola.
--
-- L'importo e' un **suggerimento**, non un vincolo: il Fantapunti 2o e' stato
-- 3 e 4 in stagioni diverse, e le scale cambiano. Propone l'ultimo usato.
-- ============================================================================

create or replace function public.voci_atti()
returns table (categoria text, voce text, importo int, volte bigint, ultima text)
language sql
security definer
set search_path = caprera, public, pg_temp
stable
as $$
  select m.categoria, m.voce,
         -- l'importo dell'uso piu' recente: le scale cambiano nel tempo, e
         -- quello vecchio suggerirebbe un numero che non si usa piu'
         (array_agg(m.crediti order by m.stagione desc))[1]::int,
         count(*),
         max(m.stagione)
    from caprera.movimenti m
   where caprera.vede_tutto()
     and m.categoria <> 'mercato'
   group by m.categoria, m.voce
   order by m.categoria, count(*) desc, m.voce;
$$;

revoke all on function public.voci_atti() from public, anon;
grant execute on function public.voci_atti() to authenticated;
