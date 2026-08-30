-- ============================================================================
-- Aprire la stagione 2026-27, seguendo il regolamento e i DPCM.
--
-- Gli importi del 2025-26 coincidono gia' con le tabelle del regolamento —
-- Fantapunti 5/3/1/-1/-2/-3, Capocannoniere 2/1/-1/-2, Trofeo Mazzarri
-- 10/5/3/-3, Ranking 3/2/1, Paratici e Zdenek 2 — quindi si portano avanti
-- invece di ribatterli, e si applicano le sole differenze del §10.6.
--
-- ⚠️ **Cosa NON si fa, e perche'.**
--
-- Il **Capology** non entra: e' stato APPROVATO NEL MECCANISMO ma BOCCIATO AL
-- REFERENDUM e rinviato. Conseguenza pratica gia' scritta nel JSON: i crediti
-- iniziali 2026-27 **non hanno gli 85 in piu'**.
--
-- I **crediti under** (3, Squadra Primavera) non si aggiungono al budget: i
-- crediti ufficiali di Fantapazz per l'asta 2026-27 sono `250 + riporti +
-- bonus + FPF` e basta — verificato societa' per societa'. Quei 3 servono a
-- prendere i primavera dopo l'asta, non a rilanciare.
--
-- I **crediti iniziali** non si toccano affatto: L0 ha deciso che si aspetta
-- il foglio di Guido aggiornato al 31 agosto.
-- ============================================================================

-- 1. Le voci continuano a valere: si portano avanti gli importi.
insert into caprera.voci_atto_importo (voce, stagione, importo)
select i.voce, '2026-27', i.importo
  from caprera.voci_atto_importo i
  join caprera.voci_atto v on v.id = i.voce
 where i.stagione = '2025-26'
   and v.attiva
   -- «Formazione non data 36a» nomina una giornata: e' il resoconto di un
   -- caso, non una voce che si riapre ogni anno. La generica c'e' gia'.
   and v.nome not ilike '%36a%'
on conflict (voce, stagione) do nothing;

-- 2. L'FPF vale 2, non 0.
-- Nel 2025-26 l'importo a catalogo era 0 perche' quell'anno nessuno aveva
-- pagato in anticipo. Per il 2026-27 hanno pagato tutti (L0, 30/08) e i
-- crediti ufficiali di Fantapazz lo confermano: +2 esatti su tutte e dieci.
update caprera.voci_atto_importo i
   set importo = 2
  from caprera.voci_atto v
 where v.id = i.voce and i.stagione = '2026-27'
   and v.categoria = 'penalita' and v.nome in ('FPF', 'FFP');

-- 3. Le riforme del §10.6 che diventano voci registrabili.
insert into caprera.voci_atto (categoria, nome, descrizione, attiva)
values
  ('premi-caprera', 'Balon d''Or Caprera',
   'Alla Societa'' del calciatore piu' || '' || 'votato dalle Societa'' (DPCM 10.25). '
   'La Presidenza candida 10 calciatori con almeno 19 partite; si vota 1o (3pt), '
   '2o (2pt), 3o (1pt), e il voto a un proprio calciatore e'' annullato.', true)
on conflict (categoria, nome) do nothing;

insert into caprera.voci_atto_importo (voce, stagione, importo)
select v.id, '2026-27', 2
  from caprera.voci_atto v
 where v.categoria = 'premi-caprera' and v.nome = 'Balon d''Or Caprera'
on conflict (voce, stagione) do nothing;

-- 4. L'assicurazione infortuni diventa obbligatoria, minimo 3 (DPCM 11.25).
-- Era 2 e volontaria: il minimo sale, e la voce lo dice invece di lasciarlo
-- nel regolamento dove nessuno lo rilegge.
insert into caprera.voci_atto (categoria, nome, descrizione, attiva)
values ('assicurazioni', 'Assicurazione infortuni',
        'Obbligatoria dal 2026-27, minimo 3 crediti (DPCM Assicurazione infortuni 11.25).',
        true)
on conflict (categoria, nome) do nothing;

insert into caprera.voci_atto_importo (voce, stagione, importo)
select v.id, '2026-27', -3
  from caprera.voci_atto v
 where v.categoria = 'assicurazioni' and v.nome = 'Assicurazione infortuni'
on conflict (voce, stagione) do nothing;

-- 5. Le giornate: 36, come le ultime sei stagioni.
update caprera.stagioni set giornate = 36, conclusa = false where id = '2026-27';
