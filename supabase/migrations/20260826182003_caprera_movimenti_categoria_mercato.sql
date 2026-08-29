-- Il registro di Guido aveva sette categorie perche' il mercato non ci passava mai:
-- i crediti spesi all'asta stavano sul foglio delle rose, non nel registro. Adesso
-- che i due si parlano serve l'ottava.
alter table caprera.movimenti drop constraint movimenti_categoria_check;
alter table caprera.movimenti add constraint movimenti_categoria_check
  check (categoria = any (array['classifiche','diritti-tv','serie-a-awards','premi-caprera',
                               'giochi','penalita','assicurazioni','mercato']));

-- Due colonne in piu', tutte e due vuote per le 261 voci gia' dentro:
-- 'calciatore' perche' una voce di mercato ha un nome e quel nome ha una scheda,
-- 'finestra' perche' nel 2021-22 il foglio scrive «Mercato Gennaio» e altrove no.
-- Dove non e' scritta resta vuota: preferisco non saperla che indovinarla.
alter table caprera.movimenti
  add column if not exists calciatore integer references caprera.calciatori(id),
  add column if not exists finestra text;

comment on column caprera.movimenti.calciatore is
  'Solo per categoria=mercato: la scheda del giocatore comprato o venduto.';
comment on column caprera.movimenti.finestra is
  'Solo per categoria=mercato: la finestra, quando il foglio la scrive (2021-22 gennaio).';

-- Entrano solo le righe che hanno trovato una scheda e che muovono crediti.
-- Le altre restano in lavoro.registro_mercato e le elenco alla Presidenza.
insert into caprera.movimenti (stagione, societa, categoria, voce, crediti, fonte, calciatore, finestra)
select m.stagione, m.societa, 'mercato', m.nome, m.crediti, 'foglio rose', m.calciatore, m.finestra
  from lavoro.registro_mercato m
 where m.calciatore is not null
   and m.crediti <> 0
   and not exists (
     select 1 from caprera.movimenti x
      where x.stagione = m.stagione and x.societa = m.societa
        and x.categoria = 'mercato' and x.voce = m.nome and x.crediti = m.crediti);
