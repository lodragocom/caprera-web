-- 1. KARAMOKO. «Quello che e' non esiste piu'.» La Presidenza chiude, e la chiusura
--    va scritta: senza, fra sei mesi qualcuno ricomincia a cercarlo. Resta una riga
--    di rosa senza scheda, e adesso si sa che e' cosi' apposta.
comment on table caprera.calciatori is
  'Anagrafe dei calciatori. Una sola riga di rosa resta senza scheda: Karamoko, Real '
  'Monghi 2021-22, un credito, mai sceso in campo. La Presidenza: «quello che e non '
  'esiste piu». Non e un lavoro da finire.';

-- 2. LE CESSIONI VERE. «Gli altri non sotto contratto ritornano nel listone per il
--    prossimo anno se rimangono in Serie A.» Il conto lo conferma: dei 1.052 cambi
--    di maglia fra una stagione e l'altra, SOLO UNDICI riguardano un giocatore il
--    cui contratto copriva ancora l'anno dopo. Gli altri 1.041 sono ritorni al
--    listone, cioe' il normale respiro dell'asta - non cessioni.
--
--    E gli undici spiegano da soli le cinque righe «fuori regola» che erano rimaste
--    in sospeso: Immobile, Kean, Muriel, Zalewski e Raspadori sono tutti li' dentro,
--    insieme a Lukaku, Vlahovic, Gosens, Zaniolo e Coco. Non erano ne' svincoli ne'
--    acquisti d'asta: erano cessioni di giocatori sotto contratto, e li' il prezzo
--    non lo fa il listone - lo fanno i due mister, magari con dei giocatori in mezzo.
insert into caprera.passaggi (stagione, calciatore, nome, da, a, tipo, certezza, fonte, nota)
select m.a_stagione, m.calciatore, m.nome, m.da_societa, m.a_societa, 'scambio', 'foglio',
       'contratti + rose',
       'sotto contratto ' || c.dalla || '/' || c.alla ||
       coalesce(', clausola ' || c.clausola, '') ||
       ': il contratto copriva ancora la stagione, quindi il passaggio non e un ritorno al listone'
  from (
    select f.stagione da_stagione, s2.id a_stagione, f.societa da_societa,
           f2.societa a_societa, f.nome, f.calciatore,
           regexp_replace(lower(f.nome),'[^a-z]','','g') k
      from caprera.rose f
      join (select id, row_number() over (order by id) n from caprera.stagioni) o1 on o1.id=f.stagione
      join (select id, row_number() over (order by id) n from caprera.stagioni) o2 on o2.n=o1.n+1
      join caprera.stagioni s2 on s2.id=o2.id
      join caprera.rose f2 on f2.stagione=s2.id and f2.calciatore=f.calciatore and f2.momento='fine'
     where f.momento='fine' and f.calciatore is not null and f2.societa <> f.societa) m
  join (select societa, regexp_replace(lower(nome),'[^a-z]','','g') k, dalla, alla, clausola
          from caprera.contratti) c
    on c.societa=m.da_societa and c.k=m.k and c.dalla <= m.a_stagione and m.a_stagione <= c.alla
 where not exists (select 1 from caprera.passaggi p
                    where p.stagione=m.a_stagione and p.calciatore=m.calciatore and p.da=m.da_societa)
on conflict do nothing;
